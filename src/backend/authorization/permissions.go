package authorization

const (
	PermCreateRecipe    = "create_recipe"
	PermEditRecipe      = "edit_recipe"
	PermDeleteRecipe    = "delete_recipe"
	PermModerateContent = "moderate_content"
	PermManageUsers     = "manage_users"
	PermManageRoles     = "manage_roles"
)

const (
	RoleUser      = "user"
	RoleChef      = "chef"
	RoleModerator = "moderator"
	RoleAdmin     = "admin"
)

var rolePermissions = map[string]map[string]bool{
	RoleUser: map[string]bool{},
	RoleChef: map[string]bool{
		PermCreateRecipe: true,
	},
	RoleModerator: map[string]bool{
		PermEditRecipe:      true,
		PermDeleteRecipe:    true,
		PermModerateContent: true,
	},
	RoleAdmin: map[string]bool{
		PermCreateRecipe:    true,
		PermEditRecipe:      true,
		PermDeleteRecipe:    true,
		PermModerateContent: true,
		PermManageUsers:     true,
		PermManageRoles:     true,
	},
}
