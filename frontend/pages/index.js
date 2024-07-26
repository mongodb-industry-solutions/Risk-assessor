// pages/index.js
import dynamic from "next/dynamic";
import styles from "../styles/Home.module.css";
import Header from "../components/Header";
import Avatar from "../components/Avatar";
import React, { useEffect } from 'react';
import BusinessPlan from "../components/businessPlan";
import { MarkersProvider, useMarkers } from "../context/Markers";
import { H2, Body } from "@leafygreen-ui/typography";
import { ParagraphSkeleton } from "@leafygreen-ui/skeleton-loader";

const Map = dynamic(() => import("../components/Map"), { ssr: false });

function LoadingContainer() {
  const { loading, llmResponse, markers } = useMarkers();
  const parts = llmResponse.split(/\*\*(.*?)\*\*/g);
  

  useEffect(() => {
    if (loading) {
      window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
    }
  }, [loading]);

  return (
    <div className={styles.container}>
      <Header />
      <div
        className={styles.loadingMain}
        style={{ height: "50%", gridTemplateColumns: "1fr 3fr" }}
      >
        <div
          className={styles.loadingContainer}
          style={{
            display: "grid",
            flexDirection: "column",
            minWidth: "25%",
            maxWidth: "30%",
            gridTemplateRows: "auto 1fr",
          }}
        >
          <Avatar />
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            height: "100%",
            width: "100%",
          }}
        >
          <div
            className={styles.loadingContainer}
            style={{ width: "95%", height: "50%" }}
          >
            <Body
              baseFontSize={16}
              weight={"medium"}
              style={{ marginTop: "5px" }}
            >
              Please indicate the business location in the USA for your real
              estate by clicking on the map, or entering the addess on the
              search bar.
            </Body>
            <Map />
          </div>
          <div
            className={styles.loadingContainer}
            style={{ width: "95%", height: "50%" }}
          >
            <Body
              baseFontSize={16}
              weight={"medium"}
              style={{ marginTop: "5px" }}
            >
              Please provide a brief description of your loan purpose and business plan.
            </Body>
            <BusinessPlan />
          </div>
        </div>
      </div>
      {loading ? (
        <div className={styles.loadingMain}>
          <div
            className={styles.loadingContainer}
            style={{ width: "100%", height: "100%" }}
          >
            <div style={{ transform: "scale(1)" }}>
              <ParagraphSkeleton
                withHeader
                style={{ width: "100%", height: "100%" }}
              />
            </div>
          </div>
        </div>
      ) : llmResponse === "" ? null : (
        <div className={styles.loadingMain}>
          <div className={styles.loadingContainer} style={{ height: "100%" }}>
            <H2>Assessor's response</H2>
            <Body
              baseFontSize={16}
              weight={"medium"}
              style={{ marginTop: "5px" }}
            >
              {paragraphs}
            </Body>
          </div>
        </div>
      )}
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
