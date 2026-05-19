import { useTranslation } from 'react-i18next';

type RolesCheckboxesProps = {
  roles: string[] | null;
  onChange: (newRoles: string[]) => void;
  availableRoles?: string[];
};

const RolesCheckboxes = ({
  roles,
  onChange,
  availableRoles = ['user', 'chef', 'moderator', 'admin'],
}: RolesCheckboxesProps) => {
  const { t } = useTranslation();

  const handleCheckboxChange = (roleKey: string, checked: boolean) => {
    if (checked) {
      onChange([...(roles ?? []), roleKey]);
    } else {
      onChange((roles ?? []).filter((r) => r !== roleKey));
    }
  };

  return (
    <div>
      <label className="mb-1 block font-medium">{t('dashboard.roles')}</label>
      <div className="mt-1 flex flex-col gap-2">
        {availableRoles.map((roleKey) => (
          <label key={roleKey} className="flex items-center gap-2">
            <input
              type="checkbox"
              value={roleKey}
              checked={roles?.includes(roleKey) ?? false}
              onChange={(e) => handleCheckboxChange(roleKey, e.target.checked)}
              className="form-checkbox h-4 w-4 text-orange-600"
            />
            <span className="text-sm">{t(`roles.${roleKey}`)}</span>
          </label>
        ))}
      </div>
    </div>
  );
};

export default RolesCheckboxes;
