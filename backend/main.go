package main

import (
	"crypto/rand"
	"log"
	"math/big"
	"net/http"
	"os"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
	"github.com/joho/godotenv"
	"golang.org/x/crypto/bcrypt"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

var jwtSecret = []byte("super_secret_jwt_key_change_me")

// User Model
type User struct {
	gorm.Model
	Name      string `json:"name"`
	Email     string `json:"email" gorm:"unique"`
	Password  string `json:"password,omitempty"`
	IsLive    bool   `json:"is_live"`
	StreamKey string `json:"stream_key" gorm:"unique"`
}

// ChatMessage Model لتخزين الرسائل في قاعدة البيانات
type ChatMessage struct {
	gorm.Model
	StreamKey string `json:"stream_key" gorm:"index"`
	Username  string `json:"username"`
	Text      string `json:"text"`
}

var DB *gorm.DB

func main() {
	_ = godotenv.Load()

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	dsn := os.Getenv("DB_CONN")
	if dsn == "" {
		dsn = "host=localhost user=postgres password=secret dbname=mydb port=5432 sslmode=disable"
	}

	var err error
	DB, err = gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		log.Fatalf("فشل الاتصال بقاعدة البيانات: %v", err)
	}
	log.Println("تم الاتصال بقاعدة البيانات بنجاح!")

	// الترحيل التلقائي للجداول
	err = DB.AutoMigrate(&User{}, &ChatMessage{})
	if err != nil {
		log.Fatalf("فشل ترحيل قاعدة البيانات: %v", err)
	}

	r := gin.Default()

	// إعداد CORS
	r.Use(func(c *gin.Context) {
		c.Writer.Header().Set("Access-Control-Allow-Origin", "*")
		c.Writer.Header().Set("Access-Control-Allow-Credentials", "true")
		c.Writer.Header().Set("Access-Control-Allow-Headers", "Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization, accept, origin, Cache-Control, X-Requested-With")
		c.Writer.Header().Set("Access-Control-Allow-Methods", "POST, OPTIONS, GET, PUT, DELETE")

		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(204)
			return
		}

		c.Next()
	})

	r.GET("/health", func(c *gin.Context) {
		c.JSON(200, gin.H{"status": "success", "message": "Backend is up and running!"})
	})

	r.POST("/register", func(c *gin.Context) {
		var input User
		if err := c.ShouldBindJSON(&input); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		hashedPassword, err := bcrypt.GenerateFromPassword([]byte(input.Password), bcrypt.DefaultCost)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "فشل تشفير كلمة المرور"})
			return
		}

		user := User{
			Name:      input.Name,
			Email:     input.Email,
			Password:  string(hashedPassword),
			IsLive:    false,
			StreamKey: "live_" + generateRandomString(10),
		}

		result := DB.Create(&user)
		if result.Error != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "البريد الإلكتروني مستخدم مسبقاً"})
			return
		}

		user.Password = ""
		c.JSON(http.StatusCreated, gin.H{"message": "تم التسجيل بنجاح", "user": user})
	})

	r.POST("/login", func(c *gin.Context) {
		var input User
		if err := c.ShouldBindJSON(&input); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		var user User
		if err := DB.Where("email = ?", input.Email).First(&user).Error; err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "بيانات الدخول غير صحيحة"})
			return
		}

		if err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(input.Password)); err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "بيانات الدخول غير صحيحة"})
			return
		}

		tokenClaims := jwt.MapClaims{
			"user_id": user.ID,
			"email":   user.Email,
			"exp":     time.Now().Add(time.Hour * 24).Unix(),
		}
		token := jwt.NewWithClaims(jwt.SigningMethodHS256, tokenClaims)
		tokenString, err := token.SignedString(jwtSecret)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "فشل إنشاء التوكن"})
			return
		}

		c.JSON(http.StatusOK, gin.H{"message": "تم تسجيل الدخول بنجاح", "token": tokenString, "name": user.Name})
	})

	// --- مسار جلب بيانات مستخدم معين عبر اسم المستخدم (مخصص لصفحة المشاهدة ViewerPage) ---
	r.GET("/user/:username", func(c *gin.Context) {
		username := c.Param("username")
		var user User
		if err := DB.Where("LOWER(name) = ?", strings.ToLower(username)).First(&user).Error; err != nil {
			c.JSON(http.StatusNotFound, gin.H{"error": "المستخدم غير موجود"})
			return
		}

		c.JSON(http.StatusOK, gin.H{
			"id":         user.ID,
			"name":       user.Name,
			"email":      user.Email,
			"is_live":    user.IsLive,
			"stream_key": user.StreamKey,
		})
	})

	// --- مسار جلب قائمة المستخدمين البثاثين النشطين ---
	r.GET("/lives", func(c *gin.Context) {
		var liveUsers []User
		DB.Where("is_live = ?", true).Select("id, name, email, stream_key, is_live").Find(&liveUsers)
		c.JSON(http.StatusOK, liveUsers)
	})

	// --- مسارات الشات الحقيقي ---
	r.GET("/chat/:streamKey", func(c *gin.Context) {
		streamKey := c.Param("streamKey")
		var messages []ChatMessage
		DB.Where("stream_key = ?", streamKey).Order("created_at asc").Limit(100).Find(&messages)
		c.JSON(http.StatusOK, messages)
	})

	r.POST("/chat", func(c *gin.Context) {
		var req struct {
			StreamKey string `json:"stream_key"`
			Username  string `json:"username"`
			Text      string `json:"text"`
		}
		if err := c.ShouldBindJSON(&req); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "بيانات غير صالحة"})
			return
		}

		msg := ChatMessage{
			StreamKey: req.StreamKey,
			Username:  req.Username,
			Text:      req.Text,
		}

		if err := DB.Create(&msg).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "فشل حفظ الرسالة"})
			return
		}

		c.JSON(http.StatusCreated, msg)
	})

	// --- مسارات MediaMTX ---
	r.POST("/live/auth", func(c *gin.Context) {
		var req struct {
			StreamKey string `json:"streamKey"`
		}
		if err := c.ShouldBindJSON(&req); err != nil {
			c.Status(http.StatusUnauthorized)
			return
		}

		streamKey := req.StreamKey
		if idx := strings.LastIndex(streamKey, "/"); idx != -1 {
			streamKey = streamKey[idx+1:]
		}

		var user User
		if err := DB.Where("stream_key = ?", streamKey).First(&user).Error; err != nil {
			c.Status(http.StatusUnauthorized)
			return
		}
		c.Status(http.StatusOK)
	})

	// مسار الـ Webhook المحدث لضمان إغلاق حالة البث بدقة عند إيقافه من OBS
	r.POST("/live/hook", func(c *gin.Context) {
		var req struct {
			StreamKey string `json:"stream_key"`
			Action    string `json:"action"`
		}
		if err := c.ShouldBindJSON(&req); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "خطأ في الطلب"})
			return
		}

		streamKey := req.StreamKey
		if idx := strings.LastIndex(streamKey, "/"); idx != -1 {
			streamKey = streamKey[idx+1:]
		}

		var user User
		if err := DB.Where("stream_key = ?", streamKey).First(&user).Error; err != nil {
			c.JSON(http.StatusNotFound, gin.H{"error": "غير موجود"})
			return
		}

		// تحديد الحالة: تصبح true فقط إذا كان الإجراء "start"، وتصبح false في أي إجراء إيقاف آخر
		isLive := (req.Action == "start")
		
		DB.Model(&user).Update("is_live", isLive)
		c.JSON(http.StatusOK, gin.H{"status": "success", "is_live": isLive})
	})

	// --- المسارات المحمية ---
	authorized := r.Group("/")
	authorized.Use(AuthMiddleware())
	{
		authorized.GET("/profile", func(c *gin.Context) {
			userID, _ := c.Get("user_id")
			var user User
			DB.First(&user, userID)
			user.Password = ""
			c.JSON(http.StatusOK, gin.H{
				"id":          user.ID,
				"name":        user.Name,
				"email":       user.Email,
				"is_live":     user.IsLive,
				"rtmp_server": "rtmp://localhost/live/",
				"stream_key":  user.StreamKey,
			})
		})

		authorized.POST("/live/toggle", func(c *gin.Context) {
			userID, _ := c.Get("user_id")
			var user User
			if err := DB.First(&user, userID).Error; err != nil {
				c.JSON(http.StatusNotFound, gin.H{"error": "المستخدم غير موجود"})
				return
			}

			newLiveState := !user.IsLive
			DB.Model(&user).Update("is_live", newLiveState)

			c.JSON(http.StatusOK, gin.H{
				"is_live":     newLiveState,
				"rtmp_server": "rtmp://localhost/live/",
				"stream_key":  user.StreamKey,
			})
		})
	}

	log.Printf("السيرفر يعمل على المنفذ: %s", port)
	r.Run(":" + port)
}

func AuthMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		authHeader := c.GetHeader("Authorization")
		if authHeader == "" {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "مفقود"})
			c.Abort()
			return
		}
		parts := strings.Split(authHeader, " ")
		if len(parts) != 2 || parts[0] != "Bearer" {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "خطأ في التوكن"})
			c.Abort()
			return
		}
		token, err := jwt.Parse(parts[1], func(t *jwt.Token) (interface{}, error) {
			return jwtSecret, nil
		})
		if err != nil || !token.Valid {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "غير صالح"})
			c.Abort()
			return
		}
		claims := token.Claims.(jwt.MapClaims)
		c.Set("user_id", uint(claims["user_id"].(float64)))
		c.Next()
	}
}

func generateRandomString(n int) string {
	const letters = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
	b := make([]byte, n)
	for i := range b {
		num, _ := rand.Int(rand.Reader, big.NewInt(int64(len(letters))))
		b[i] = letters[num.Int64()]
	}
	return string(b)
}