export interface OGTagOptions {
  title: string;
  description: string;
  image?: string;
  url: string;
  type?: 'website' | 'article' | 'image';
  twitterImage?: string;
}

export function generateOGTags(options: OGTagOptions) {
  const {
    title,
    description,
    image = 'https://cosplay-portfolio.vercel.app/og/default.jpg',
    url,
    type = 'website',
    twitterImage = image,
  } = options;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url,
      type,
      images: [
        {
          url: image,
          width: 1080,
          height: 1600,
          type: 'image/jpeg',
        },
      ],
      siteName: 'Cosplay Portfolio',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [twitterImage],
    },
  };
}
