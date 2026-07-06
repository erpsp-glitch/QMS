import { useEffect, useState } from "react";
import { certApi } from "../../../api/qms.api";

interface Cert { id: number; code: string; name: string; }

interface Props {
  value: number | null;
  onChange: (id: number | null) => void;
  className?: string;
}

export default function CertFilter({ value, onChange, className = "" }: Props) {
  const [certs, setCerts] = useState<Cert[]>([]);

  useEffect(() => {
    certApi.getActive().then((d: unknown) => setCerts(Array.isArray(d) ? d as Cert[] : [])).catch(() => {});
  }, []);

  return (
    <select
      value={value ?? ""}
      onChange={(e) => onChange(e.target.value ? Number(e.target.value) : null)}
      className={`border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-600 ${className}`}
    >
      <option value="">All Certifications</option>
      {certs.map((c) => (
        <option key={c.id} value={c.id}>
          {c.code} — {c.name}
        </option>
      ))}
    </select>
  );
}
