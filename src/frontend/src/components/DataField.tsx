interface DataFieldProps {
  label: string;
  value: string | number;
}

const DataField = ({ label, value }: DataFieldProps) => {
  return (
    <p className={`text-lg`}>
      <strong>{label}:</strong> {value}
    </p>
  );
};

export default DataField;
