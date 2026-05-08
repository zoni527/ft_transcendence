interface DataFieldProps {
  label: string;
  value: string | number;
}

const DataField = ({ label, value }: DataFieldProps) => {
  return (
    <div className="flex flex-col">
      <span className="text-lg text-gray-500">{label}</span>
      <span className="text-xl font-medium text-gray-800">{value}</span>
    </div>
  );
};

export default DataField;
