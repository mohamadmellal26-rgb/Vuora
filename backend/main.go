package main

import (
	"crypto/rand"
	"log"
	"math/big"
	"net/http"
	"os"
	"strings"
	"sync"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
	"github.com/joho/godotenv"
	"golang.org/x/crypto/bcrypt"
)

var jwtSecret = []byte("super_secret_jwt_key_change_me")

// User Model (ذاكرة RAM)
type User struct {
	ID        uint   `json:"id"`
	Name      string `json:"name"`
	Email     string `json:"email"`
	Password  string `json:"password,omitempty"`
	IsLive    bool   `json:"is_live"`
	StreamKey string `json:"stream_key"`
}

// ChatMessage Model (ذاكرة RAM)
type ChatMessage struct {
	ID        uint      `json:"id"`
	StreamKey string    `json:"stream_key"`
	Username  string    `json:"username"`
	Text      string    `json:"text"`
	CreatedAt time.Time `json:"created_at"`
}

// تخزين الذاكرة المؤقتة مع قفل آمن (In-Memory Storage)
var (
	users       = make(map[uint]User)
	userEmails  = make(map[string]uint) // للبحث السريع عن البريد الإلكتروني ومنع التكرار
	streamKeys  = make(map[string]uint) // للبحث السريع عن مفتاح البث
	chatMessages = make(map[string][]ChatMessage)
	nextUserID  uint = 1
	nextMsgID   uint = 1
	mu          sync.RWMutex
)

func main() {
	_ = godotenv.Load()

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
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
		c.JSON(200, gin.H{"status": "success", "message": "Backend is up and running with RAM storage!"})
	})

	r.POST("/register", func(c *gin.Context) {
		var input User
		if err := c.ShouldBindJSON(&input); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		mu.Lock()
		defer mu.Unlock()

		// التحقق من تكرار البريد الإلكتروني
		if _, exists := userEmails[input.Email]; exists {
			c.JSON(http.StatusBadRequest, gin.H{"error": "البريد الإلكتروني مستخدم مسبقاً"})
			return
		}

		hashedPassword, err := bcrypt.GenerateFromPassword([]byte(input.Password), bcrypt.DefaultCost)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "فشل تشفير كلمة المرور"})
			return
		}

		userID := nextUserID
		nextUserID++

		sKey := "live_" + generateRandomString(10)

		newUser := User{
			ID:        userID,
			Name:      input.Name,
			Email:     input.Email,
			Password:  string(hashedPassword),
			IsLive:    false,
			StreamKey: sKey,
		}

		users[userID] = newUser
		userEmails[input.Email] = userID
		streamKeys[sKey] = userID

		newUser.Password = ""
		c.JSON(http.StatusCreated, gin.H{"message": "تم التسجيل بنجاح", "user": newUser})
	})

	r.POST("/login", func(c *gin.Context) {
		var input User
		if err := c.ShouldBindJSON(&input); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		mu.RLock()
		userID, exists := userEmails[input.Email]
		if !exists {
			mu.RUnlock()
			c.JSON(http.StatusUnauthorized, gin.H{"error": "بيانات الدخول غير صحيحة"})
			return
		}
		user := users[userID]
		mu.RUnlock()

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

	// --- مسار جلب بيانات مستخدم معين عبر اسم المستخدم ---
	r.GET("/user/:username", func(c *gin.Context) {
		username := c.Param("username")

		mu.RLock()
		defer mu.RUnlock()

		var foundUser User
		exists := false
		for _, u := range users {
			if strings.EqualFold(u.Name, username) {
				foundUser = u
				exists = true
				break
			}
		}

		if !exists {
			c.JSON(http.StatusNotFound, gin.H{"error": "المستخدم غير موجود"})
			return
		}

		c.JSON(http.StatusOK, gin.H{
			"id":         foundUser.ID,
			"name":       foundUser.Name,
			"email":      foundUser.Email,
			"is_live":    foundUser.IsLive,
			"stream_key": foundUser.StreamKey,
		})
	})

	// --- مسار جلب قائمة المستخدمين البثاثين النشطين ---
	r.GET("/lives", func(c *gin.Context) {
		mu.RLock()
		defer mu.RUnlock()

		var liveUsers []User
		for _, u := range users {
			if u.IsLive {
				liveUsers = append(liveUsers, User{
					ID:        u.ID,
					Name:      u.Name,
					Email:     u.Email,
					IsLive:    u.IsLive,
					StreamKey: u.StreamKey,
				})
			}
		}

		c.JSON(http.StatusOK, liveUsers)
	})

	// --- مسارات الشات الحقيقي ---
	r.GET("/chat/:streamKey", func(c *gin.Context) {
		streamKey := c.Param("streamKey")

		mu.RLock()
		defer mu.RUnlock()

		msgs := chatMessages[streamKey]
		if len(msgs) > 100 {
			msgs = msgs[len(msgs)-100:]
		}

		c.JSON(http.StatusOK, msgs)
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

		mu.Lock()
		msgID := nextMsgID
		nextMsgID++

		msg := ChatMessage{
			ID:        msgID,
			StreamKey: req.StreamKey,
			Username:  req.Username,
			Text:      req.Text,
			CreatedAt: time.Now(),
		}

		chatMessages[req.StreamKey] = append(chatMessages[req.StreamKey], msg)
		mu.Unlock()

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

		mu.RLock()
		_, exists := streamKeys[streamKey]
		mu.RUnlock()

		if !exists {
			c.Status(http.StatusUnauthorized)
			return
		}
		c.Status(http.StatusOK)
	})

	// مسار الـ Webhook للتحكم بحالة البث
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

		mu.Lock()
		userID, exists := streamKeys[streamKey]
		if !exists {
			mu.Unlock()
			c.JSON(http.StatusNotFound, gin.H{"error": "غير موجود"})
			return
		}

		user := users[userID]
		isLive := (req.Action == "start")
		user.IsLive = isLive
		users[userID] = user
		mu.Unlock()

		c.JSON(http.StatusOK, gin.H{"status": "success", "is_live": isLive})
	})

	// --- المسارات المحمية ---
	authorized := r.Group("/")
	authorized.Use(AuthMiddleware())
	{
		authorized.GET("/profile", func(c *gin.Context) {
			userID, _ := c.Get("user_id")

			mu.RLock()
			user, exists := users[userID.(uint)]
			mu.RUnlock()

			if !exists {
				c.JSON(http.StatusNotFound, gin.H{"error": "المستخدم غير موجود"})
				return
			}

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

			mu.Lock()
			user, exists := users[userID.(uint)]
			if !exists {
				mu.Unlock()
				c.JSON(http.StatusNotFound, gin.H{"error": "المستخدم غير موجود"})
				return
			}

			newLiveState := !user.IsLive
			user.IsLive = newLiveState
			users[userID.(uint)] = user
			mu.Unlock()

			c.JSON(http.StatusOK, gin.H{
				"is_live":     newLiveState,
				"rtmp_server": "rtmp://localhost/live/",
				"stream_key":  user.StreamKey,
			})
		})
	}

	log.Printf("السيرفر يعمل على المنفذ (تخزين داخل الذاكرة RAM): %s", port)
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
