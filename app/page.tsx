import Image from "next/image";
import styles from "./styles/styles.module.css";
import Header from "@/components/shared/header"; 
import { FileText, Eye, Settings, ClipboardList } from 'lucide-react';

export default function Home() {

const cards = [
  {
    icon: <FileText size={48} className={styles.icon} />,
    title: 'Document Management',
    desc: 'Leading healthcare education programs with state-of-the-art facilities, clinical training, and partnerships with top medical institutions.'
  },
  {
    icon: <Eye size={48} className={styles.icon} />,
    title: 'Real-time Visibility',
    desc: 'Track document status and progress throughout the entire lifecycle from creation to completion.'
  },
  {
    icon: <Settings size={48} className={styles.icon} />,
    title: 'Enhance Efficiency',
    desc: 'Streamlined workflows and automated processes reduce processing time and eliminate bottlenecks.'
  },
  {
    icon: <ClipboardList size={48} className={styles.icon} />,
    title: 'Accountability',
    desc: 'Complete audit trails and reporting capabilities for full transparency and accountability.'
  }
];

const steps = [
    {
      number: '1',
      title: 'Upload Document',
      desc: 'Submit your document with required details and attachments to the system.'
    },
    {
      number: '2',
      title: 'Route to Approval',
      desc: 'System automatically routes to appropriate departments and school heads for review.'
    },
    {
      number: '3',
      title: 'Track Progress',
      desc: 'Monitor real-time status – pending or completed with full visibility.'
    },
    {
      number: '4',
      title: 'Digital Signature',
      desc: 'Authorized personnel can review, sign, and forward documents electronically.'
    }
  ];


  return (
    <div>
      <Header /> 
      <div className={`${styles.parallaxSection} ${styles.parallax1}`}>
          <p className={styles.text1}>UNIVERSITY  OF PERPETUAL  HELP SYSTEM DALTA</p>
          <p className={styles.text2}>Digital Document Management</p>

  
        </div>
      <div data-aos="fade-up" className={styles.contentSection}>
          <h1>SYSTEM FEATURES</h1>
          <div className={styles.features}>
      {cards.map((card, index) => (
        <div key={index} className={styles.card}>
         <div className={styles.iconWrapper}>
{card.icon}

  
</div>
          <h3 className={styles.title}>{card.title}</h3>
          <p className={styles.description}>{card.desc}</p>
        </div>
      ))}
    </div>
        </div>

        <div className={`${styles.parallaxSection} ${styles.parallax2}`}>
          <p className={styles.text2}>JOIN US NOW</p>
          <p className={styles.text3}>Aims to improve efficiency and accountability in 
            handling school-issued documents, providing visibility for 
            both employees and administrators throughout the document life cycle.</p>

  
        </div>

       <section className={styles.contentSection}>
      <h1>How It Works?</h1>
      <div className={styles.steps}>
        {steps.map((step, index) => (
          <div key={index} className={styles.step}>
            <div className={styles.circle}>{step.number}</div>
            <h3 className={styles.title}>{step.title}</h3>
            <p className={styles.description}>{step.desc}</p>
          </div>
        ))}
      </div>
    </section>
    <div className={`${styles.parallaxSection} ${styles.parallax2}`}>
          <div className={styles.logo}>
        <Image src="/full-logo.png" alt="Logo Icon" width={500} height={500} />
      </div>

  
        </div>
        <footer
          className={styles.footerCopyright}
        >
          <p>
            © Copyright <span>UPHSD Document Tracking System</span>. All Rights
            Reserved.
          </p>
          <p>
            Created by{" "}
            <span className={styles.highlighted}>PRINCESS BATUMBAKAL</span>
          </p>
        </footer>
    </div>
  );
}
