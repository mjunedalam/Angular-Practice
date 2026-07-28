function escapePdfText(text: string): string {
  return text.replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)');
}

// Hand-built minimal PDF (byte-accurate xref) so the approval-PDF fallback needs no external library.
export function buildApprovalPdfBlob(title: string, lines: readonly string[]): Blob {
  const encoder = new TextEncoder();
  const textOps = [title, '', ...lines]
    .map((line, i) => `BT /F1 ${i === 0 ? 16 : 11} Tf 72 ${740 - i * 20} Td (${escapePdfText(line)}) Tj ET`)
    .join('\n');
  const contentStream = `${textOps}\n`;
  const contentBytes = encoder.encode(contentStream);

  const objects = [
    '<< /Type /Catalog /Pages 2 0 R >>',
    '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
    '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>',
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>',
    `<< /Length ${contentBytes.length} >>\nstream\n${contentStream}endstream`,
  ];

  let pdf = '%PDF-1.4\n';
  const offsets: number[] = [];
  objects.forEach((body, i) => {
    offsets.push(encoder.encode(pdf).length);
    pdf += `${i + 1} 0 obj\n${body}\nendobj\n`;
  });

  const xrefOffset = encoder.encode(pdf).length;
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  pdf += offsets.map(offset => `${offset.toString().padStart(10, '0')} 00000 n \n`).join('');
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;

  return new Blob([encoder.encode(pdf)], { type: 'application/pdf' });
}
