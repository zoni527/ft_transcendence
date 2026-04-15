package handlers

import (
	"testing"

	"golang.org/x/crypto/bcrypt"
)

func TestIsPasswordStrong(t *testing.T) {
	testCases := []struct {
		name     string
		password string
		expected bool
	}{
		{"weak: single character repeated", "aaaaaaaa", false},
		{"weak: simple 8 chars", "password", false},
		{"weak: short numeric", "12345678", false},
		{"weak: alphanumeric", "Pass1234", false},
		{"strong: mixed with special chars", "Mango!Orbit$River29Tea", true},
		{"weak: phrase with numbers", "Coffee2026IsGreat", false},
		{"strong: long passphrase", "MyDogNameIsFluffy2026!", true},
		{"empty password", "", false},
		{"spaces only", "        ", false},
	}

	for _, tc := range testCases {
		t.Run(tc.name, func(t *testing.T) {
			result := IsPasswordStrong(tc.password)
			if result != tc.expected {
				t.Errorf("password %q: expected %v, got %v", tc.password, tc.expected, result)
			}
		})
	}
}

func TestHashPassword(t *testing.T) {
	testCases := []struct {
		name      string
		password  string
		shouldErr bool
	}{
		{"valid password", "Mango!Orbit$River29Tea", false},
		{"another valid password", "SecurePass123!", false},
		{"empty string", "", false}, // bcrypt can hash empty string, though not recommended
	}

	for _, tc := range testCases {
		t.Run(tc.name, func(t *testing.T) {
			hashed, err := HashPassword(tc.password)

			if tc.shouldErr && err == nil {
				t.Errorf("expected error, got none")
				return
			}

			if !tc.shouldErr && err != nil {
				t.Errorf("unexpected error: %v", err)
				return
			}

			// Verify hash is not empty
			if hashed == "" {
				t.Errorf("hash is empty")
				return
			}

			// Verify hash starts with bcrypt marker
			if hashed[:4] != "$2a$" && hashed[:4] != "$2b$" && hashed[:4] != "$2x$" && hashed[:4] != "$2y$" {
				t.Errorf("hash does not look like bcrypt format: %s", hashed[:10])
				return
			}

			// Verify we can compare password with hash
			err = bcrypt.CompareHashAndPassword([]byte(hashed), []byte(tc.password))
			if err != nil {
				t.Errorf("verify hash failed: %v", err)
			}
		})
	}
}

func TestHashPasswordUnique(t *testing.T) {
	password := "Mango!Orbit$River29Tea"
	hash1, err1 := HashPassword(password)
	hash2, err2 := HashPassword(password)

	if err1 != nil || err2 != nil {
		t.Fatalf("unexpected error hashing password")
	}

	// Hashes should be different due to random salt
	if hash1 == hash2 {
		t.Errorf("two bcrypt hashes of same password should differ (random salt)")
	}

	// Both should verify against the password
	if err := bcrypt.CompareHashAndPassword([]byte(hash1), []byte(password)); err != nil {
		t.Errorf("hash1 verify failed: %v", err)
	}
	if err := bcrypt.CompareHashAndPassword([]byte(hash2), []byte(password)); err != nil {
		t.Errorf("hash2 verify failed: %v", err)
	}
}
