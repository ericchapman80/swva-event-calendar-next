import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Image from 'next/image';
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

export default function Home() {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    // Commented out Instagram connection logic
    /*
    const fetchInstagramPosts = async () => {
      try {
        const response = await axios.get('/api/instagram');
        setPosts(response.data);
      } catch (error) {
        console.error('Error fetching Instagram posts:', error);
      }
    };

    fetchInstagramPosts();
    */
  }, []);

  return (
    <main className={`flex min-h-screen flex-col items-center justify-between p-24 ${inter.className}`}>
      {/* <h1>Latest Posts from SWVA Sports and Events</h1> */}
      <h1>Welcome to SWVA Sports & Activities</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {posts.length > 0 ? (
          posts.map((post) => (
            <div key={post.id} className="p-4 border rounded-lg">
              <Image src={post.media_url} alt={post.caption} width={500} height={500} />
              <p>{post.caption}</p>
            </div>
          ))
        ) : (
          <p>No posts available. Please check back later.</p>
        )}
      </div>
    </main>
  );
}