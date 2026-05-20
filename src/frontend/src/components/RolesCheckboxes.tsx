import { useTranslation } from 'react-i18next';
import { cardBase, inputFieldBase, inputLabelText } from '../styles/styles';

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
    const currentRoles = roles ?? [];

    if (checked) {
      if (!currentRoles.includes(roleKey)) {
        onChange([...currentRoles, roleKey]);
      }
      return;
    }

    if (currentRoles.length === 1) {
      return;
    }

    onChange(currentRoles.filter((r) => r !== roleKey));
  };

  return (
    <div>
      <label className={`${inputLabelText}`}>{t('dashboard.roles')}</label>
      <div className={`${cardBase} ${inputFieldBase} mt-1 flex flex-col gap-2`}>
        {availableRoles.map((roleKey) => (
          <label key={roleKey} className="flex items-center gap-2">
            <input
              type="checkbox"
              value={roleKey}
              checked={roles?.includes(roleKey) ?? false}
              onChange={(e) => handleCheckboxChange(roleKey, e.target.checked)}
              className="form-checkbox h-4 w-4 accent-orange-700"
            />
            <span className="text-md">{t(`roles.${roleKey}`)}</span>
          </label>
        ))}
      </div>
    </div>
  );
};

export default RolesCheckboxes;
