package authorization

import "regexp"

var uuidRegex = regexp.MustCompile(`^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$`)

// IsValidUUID checks whether the provided value matches the expected UUID format
func IsValidUUID(s string) bool {
	return uuidRegex.MatchString(s)
}
