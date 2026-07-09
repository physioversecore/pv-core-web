interface EmptyTableRowProps {
  colSpan: number;
  message: string;
}

export function EmptyTableRow({ colSpan, message }: EmptyTableRowProps) {
  return (
    <tr>
      <td colSpan={colSpan} className="p-4 text-center text-text-light text-sm">
        {message}
      </td>
    </tr>
  );
}
