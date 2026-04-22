interface StructuredDataProps {
  data: Record<string, any>;
}

/**
 * Component to render JSON-LD structured data in the document head
 */
export default function StructuredData({ data }: StructuredDataProps) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
      suppressHydrationWarning
    />
  );
}
