interface DetailFieldProps {
  label: string;
  value: string | number;
}

const DetailField = ({ label, value }: DetailFieldProps) => {
  return (
    <p className={`text-lg`}>
      <strong>{label}:</strong> {value}
    </p>
  );
};

export default DetailField;
