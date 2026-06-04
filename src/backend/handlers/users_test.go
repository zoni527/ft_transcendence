package handlers

//
//import (
//	"net/http"
//	"net/http/httptest"
//	"net/url"
//	"strings"
//	"testing"
//
//	"github.com/gin-gonic/gin"
//)
//
//func TestSearchUserQueryLength(t *testing.T) {
//	gin.SetMode(gin.TestMode)
//
//	tests := []struct {
//		name    string
//		query   string
//		wantMsg string
//	}{
//		{
//			name:    "too short",
//			query:   "a",
//			wantMsg: "query must be at least 2 characters",
//		},
//		{
//			name:    "too long",
//			query:   strings.Repeat("é", searchUserQueryMaxLen+1),
//			wantMsg: "query must be at most 50 characters",
//		},
//	}
//
//	for _, tt := range tests {
//		t.Run(tt.name, func(t *testing.T) {
//			router := gin.New()
//			router.GET("/api/users/search", SearchUser)
//
//			req := httptest.NewRequest(http.MethodGet, "/api/users/search?q="+url.QueryEscape(tt.query), nil)
//			w := httptest.NewRecorder()
//
//			router.ServeHTTP(w, req)
//
//			if w.Code != http.StatusBadRequest {
//				t.Fatalf("status code = %d, want %d", w.Code, http.StatusBadRequest)
//			}
//			if !strings.Contains(w.Body.String(), tt.wantMsg) {
//				t.Fatalf("response body = %q, want message %q", w.Body.String(), tt.wantMsg)
//			}
//		})
//	}
//}
//
//func TestPasswordStrength(t *testing.T) {
//	tests := []struct {
//		name       string
//		password   string
//		wantErr    bool
//		wantStrong bool
//	}{
//		{
//			name:       "weak common password",
//			password:   "password123",
//			wantErr:    false,
//			wantStrong: false,
//		},
//		{
//			name:       "weak repeated password",
//			password:   "aaaaaaaa",
//			wantErr:    false,
//			wantStrong: false,
//		},
//		{
//			name:       "weak short password",
//			password:   "abc12345",
//			wantErr:    false,
//			wantStrong: false,
//		},
//		{
//			name:       "valid strong password",
//			password:   "CorrectHorseBatteryStaple#2026!",
//			wantErr:    false,
//			wantStrong: true,
//		},
//	}
//
//	for _, tt := range tests {
//		t.Run(tt.name, func(t *testing.T) {
//			if err := validatePassword(tt.password); (err != nil) != tt.wantErr {
//				t.Fatalf("validatePassword(%q) error = %v, wantErr %v", tt.password, err, tt.wantErr)
//			}
//			if got := isPasswordStrong(tt.password); got != tt.wantStrong {
//				t.Fatalf("isPasswordStrong(%q) = %v, want %v", tt.password, got, tt.wantStrong)
//			}
//		})
//	}
//}
//
//func TestCreateUserValidation(t *testing.T) {
//	gin.SetMode(gin.TestMode)
//
//	tests := []struct {
//		name       string
//		body       string
//		wantStatus int
//		wantMsg    string
//	}{
//		{
//			name:       "malformed json",
//			body:       `{"email":`,
//			wantStatus: http.StatusBadRequest,
//			wantMsg:    "invalid input data",
//		},
//		{
//			name:       "missing required fields",
//			body:       `{}`,
//			wantStatus: http.StatusBadRequest,
//			wantMsg:    "invalid input data",
//		},
//		{
//			name:       "invalid email",
//			body:       `{"email":"bad\n@example.com","password":"StrongPass123!","name":"Test User","display_name":"test-user"}`,
//			wantStatus: http.StatusBadRequest,
//			wantMsg:    "email contains control characters",
//		},
//		{
//			name:       "invalid name",
//			body:       `{"email":"user@example.com","password":"StrongPass123!","name":"--","display_name":"test-user"}`,
//			wantStatus: http.StatusBadRequest,
//			wantMsg:    "invalid name",
//		},
//		{
//			name:       "invalid display name",
//			body:       `{"email":"user@example.com","password":"StrongPass123!","name":"Test User","display_name":"bad!name"}`,
//			wantStatus: http.StatusBadRequest,
//			wantMsg:    "invalid display_name",
//		},
//		{
//			name:       "password with control characters",
//			body:       `{"email":"user@example.com","password":"Strong\nPass123!","name":"Test User","display_name":"test-user"}`,
//			wantStatus: http.StatusBadRequest,
//			wantMsg:    "password contains invalid control characters",
//		},
//		{
//			name:       "weak password",
//			body:       `{"email":"user@example.com","password":"password123","name":"Test User","display_name":"test-user"}`,
//			wantStatus: http.StatusUnprocessableEntity,
//			wantMsg:    "password is too weak",
//		},
//	}
//
//	for _, tt := range tests {
//		t.Run(tt.name, func(t *testing.T) {
//			router := gin.New()
//			router.POST("/api/users", CreateUser)
//
//			req := httptest.NewRequest(http.MethodPost, "/api/users", strings.NewReader(tt.body))
//			req.Header.Set("Content-Type", "application/json")
//			w := httptest.NewRecorder()
//
//			router.ServeHTTP(w, req)
//
//			if w.Code != tt.wantStatus {
//				t.Fatalf("status code = %d, want %d", w.Code, tt.wantStatus)
//			}
//			if !strings.Contains(w.Body.String(), tt.wantMsg) {
//				t.Fatalf("response body = %q, want message %q", w.Body.String(), tt.wantMsg)
//			}
//		})
//	}
//}
