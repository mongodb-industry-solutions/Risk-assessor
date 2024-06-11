// pages/index.js
import dynamic from 'next/dynamic';
import styles from '../styles/Home.module.css';
import Header from '../components/Header';
import Avatar from '../components/Avatar';  
import React from 'react';
import BusinessPlan from '../components/BusinessPlan';
import { MarkersProvider, useMarkers } from '../context/Markers';
import { H2,Body }  from '@leafygreen-ui/typography';
import { ListSkeleton, ParagraphSkeleton } from '@leafygreen-ui/skeleton-loader';


const Map = dynamic(() => import('../components/Map'), { ssr: false });

function LoadingContainer() {
  const { loading, llmResponse, markers } = useMarkers();
  const intro = "Welcome to our leafy business loan risk assessor, this demo assumes the scenario of an application for a business loan to start/expand a business that requires a physical real estate (eg. a bakery shop, restaurant, etc): \n\t- Please provide a brief description of your loan purpose and business plan \n\t- Please indicate the business location of you real estate";
  
  const text = llmResponse !== '' ? llmResponse : intro;
  
  const paragraphs = text.split('\n').map((line, index) => (
    <Body baseFontSize={16} key={index} style={{marginTop:'5px'}}>{line}</Body>
  ));

  const title = llmResponse !== '' ? <H2>Assessor's response</H2> : <H2>Instructions</H2>;

  return (
      <div className={styles.container}>
        <Header />
        <div className={styles.loadingMain} style={{minHeight: '43vh', gridTemplateColumns: '1fr 3fr'}}>
          <div className={styles.loadingContainer} style={{width:'25%'}}>
            <Avatar src="http://localhost:3000/userAvatar.png" />
          </div>
          <div className={styles.loadingContainer} style={{width:'75%'}}>
          <div>
            {loading ? (
              <div style={{ transform: 'scale(2)' }}>
                <ParagraphSkeleton withHeader style={{ width: '100%', height: '100%' }}/>
              </div>
            ) : (
              <div>
                {title}
                {paragraphs}
              </div>
            )}
          </div>
          </div>
        </div>
        <div className={styles.loadingMain} style={{minHeight: '47vh', marginTop:'10px'}}>
          <div className={styles.mapContainer} style={{width:'50%'}}>
            <Map />
          </div>
          <div className={styles.mapContainer} style={{width:'50%'}}>
            <BusinessPlan/>
          </div>
        </div>
      </div>
    
  );
}

export default function Home() {
  return (
    <MarkersProvider>
      <LoadingContainer />
    </MarkersProvider>
  );
}