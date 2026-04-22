import Link from 'next/link';
import StructuredData from './StructuredData';
import { generateBreadcrumbSchema } from '@/lib/utils/seo';

interface Breadcrumb {
  name: string;
  url: string;
}

interface BreadcrumbsProps {
  items: Breadcrumb[];
}

export default function Breadcrumbs({ items }: BreadcrumbsProps) {
  const breadcrumbSchema = generateBreadcrumbSchema(items);

  return (
    <>
      <StructuredData data={breadcrumbSchema} />
      <nav className="breadcrumbs" aria-label="Breadcrumb">
        <ol className="breadcrumbs__list">
          {items.map((item, index) => (
            <li key={index} className="breadcrumbs__item">
              {index < items.length - 1 ? (
                <>
                  <Link href={item.url} className="breadcrumbs__link">
                    {item.name}
                  </Link>
                  <span className="breadcrumbs__separator">/</span>
                </>
              ) : (
                <span className="breadcrumbs__current">{item.name}</span>
              )}
            </li>
          ))}
        </ol>
      </nav>
    </>
  );
}
