const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

// Read .env.local
const envPath = path.join(process.cwd(), '.env.local');
const envContent = fs.readFileSync(envPath, 'utf-8');
const credentialsMatch = envContent.match(/FIREBASE_CREDENTIALS=({.*?})(?:\n|$)/);

if (!credentialsMatch) {
  console.error('❌ FIREBASE_CREDENTIALS not found in .env.local');
  process.exit(1);
}

const credentials = JSON.parse(credentialsMatch[1]);

// Initialize Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert(credentials),
});

const db = admin.firestore();

async function seedDatabase() {
  try {
    console.log('🌱 Seeding Firestore with test data...\n');

    // Test albums data
    const albumsData = {
      events: [
        {
          name: 'Anime Expo 2024',
          type: 'events',
          coverImage: 'https://picsum.photos/400/300?random=1',
          displayOrder: 1,
          description: 'Amazing cosplay photos from Anime Expo 2024',
          eventDate: '2024-07-06',
          location: 'Los Angeles Convention Center',
          photoCount: 45,
        },
        {
          name: 'Comic Con 2024',
          type: 'events',
          coverImage: 'https://picsum.photos/400/300?random=2',
          displayOrder: 2,
          description: 'Incredible costumes at Comic Con International',
          eventDate: '2024-07-25',
          location: 'San Diego Convention Center',
          photoCount: 62,
        },
      ],
      studio: [
        {
          name: 'Studio Session - Character Study',
          type: 'studio',
          coverImage: 'https://picsum.photos/400x300?text=Studio+Session',
          displayOrder: 1,
          description: 'Professional studio photography session',
          eventDate: '2024-06-15',
          location: 'Downtown Studio',
          photoCount: 28,
        },
        {
          name: 'Professional Headshots',
          type: 'studio',
          coverImage: 'https://picsum.photos/400x300?text=Headshots',
          displayOrder: 2,
          description: 'High-quality professional portraits',
          eventDate: '2024-05-20',
          location: 'Downtown Studio',
          photoCount: 15,
        },
      ],
      outdoor: [
        {
          name: 'Sunset Shoot at Pier',
          type: 'outdoor',
          coverImage: 'https://picsum.photos/400x300?text=Sunset+Pier',
          displayOrder: 1,
          description: 'Golden hour outdoor photography',
          eventDate: '2024-06-10',
          location: 'Santa Monica Pier',
          photoCount: 35,
        },
        {
          name: 'Urban Location Shoot',
          type: 'outdoor',
          coverImage: 'https://picsum.photos/400x300?text=Urban+Shoot',
          displayOrder: 2,
          description: 'City backdrop cosplay photoshoot',
          eventDate: '2024-07-01',
          location: 'Downtown LA',
          photoCount: 42,
        },
      ],
      collabs: [
        {
          name: 'Collaboration with MegaCon',
          type: 'collabs',
          coverImage: 'https://picsum.photos/400x300?text=MegaCon+Collab',
          displayOrder: 1,
          description: 'Joint photo session with MegaCon team',
          eventDate: '2024-05-15',
          location: 'Orlando, FL',
          photoCount: 50,
        },
        {
          name: 'Instagram Influencer Shoot',
          type: 'collabs',
          coverImage: 'https://picsum.photos/400x300?text=Influencer+Shoot',
          displayOrder: 2,
          description: 'Content creation with fellow cosplayers',
          eventDate: '2024-06-22',
          location: 'TBD',
          photoCount: 38,
        },
      ],
    };

    // Seed albums
    for (const [type, albums] of Object.entries(albumsData)) {
      const collectionRef = db.collection(type);

      for (const album of albums) {
        const docRef = await collectionRef.add(album);
        console.log(`✅ Created ${type} album: "${album.name}" (ID: ${docRef.id})`);
      }
    }

    // Seed site config and featured
    const configData = {
      brandName: 'Cosplay Portfolio',
      instagram: '@cosplay_portfolio',
      ogImages: {
        home: 'https://picsum.photos/1200x630?text=Cosplay+Portfolio',
        events: 'https://picsum.photos/1200x630?text=Events',
        studio: 'https://picsum.photos/1200x630?text=Studio',
        outdoor: 'https://picsum.photos/1200x630?text=Outdoor',
        collabs: 'https://picsum.photos/1200x630?text=Collabs',
      },
      featured: [
        {
          url: 'https://picsum.photos/600x400?text=Featured+1',
          thumbUrl: 'https://picsum.photos/300x200?text=Featured+1',
          cosplayer: 'Amazing Cosplayer',
          event: 'Anime Expo 2024',
        },
        {
          url: 'https://picsum.photos/600x400?text=Featured+2',
          thumbUrl: 'https://picsum.photos/300x200?text=Featured+2',
          cosplayer: 'Talented Creator',
          event: 'Comic Con 2024',
        },
        {
          url: 'https://picsum.photos/600x400?text=Featured+3',
          thumbUrl: 'https://picsum.photos/300x200?text=Featured+3',
          cosplayer: 'Professional Cosplay Artist',
          event: 'Studio Session',
        },
      ],
    };

    await db.collection('site').doc('config').set(configData);
    console.log('✅ Created site configuration');

    console.log('\n✨ Database seeding complete!');
    console.log('You can now view the site at http://localhost:3000');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
}

seedDatabase();
