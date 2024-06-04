// pages/index.js
import dynamic from 'next/dynamic';
import styles from '../styles/Home.module.css';
import Header from '../components/Header';
import Avatar from '../components/Avatar';  
import React, { useState, useEffect } from 'react';
import BusinessPlan from '@/components/businessPlan';

const Map = dynamic(() => import('../components/Map'), { ssr: false });

export default function Home() {
  const [value, setValue] = useState('');

  return (
    <div className={styles.container}>
      <Header />
      <div className={styles.main}>
        <div className={styles.mapContainer}>
          <Avatar src="http://localhost:3000/userAvatar.png" />
        </div>
        <div className={styles.mapContainer}>
          <Map showIcon={true} coordinates={{ lat: 40.75557954275589, lng: -73.986330023002626 }}/>  
        </div>
        <div className={styles.mapContainer} >
          <div>
            <BusinessPlan/>
          </div>
        </div>
      </div>
    </div>
  );
}