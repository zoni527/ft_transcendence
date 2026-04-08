interface RecipeDetailFieldProps {
  label: string;
  value: string | number;
}

const RecipeDetailField = ({ label, value }: RecipeDetailFieldProps) => {
  return (
    <p className={`text-lg`}>
      <strong>{label}:</strong> {value}
    </p>
  );
};

export default RecipeDetailField;
