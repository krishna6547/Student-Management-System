import styles from './about.module.css';
import Header from '../components/header';

const About = () => {
  return (
    <div className={styles.aboutBg}>
      <Header />
      <main>
        <section className={styles.aboutCard}>
          <h1>About Us</h1>
          <p>
            Welcome to our Student Management System!<br/>
            This platform is designed to streamline school operations, making it easy for administrators, teachers, and students to manage classes, attendance, grades, and more.
          </p>
          <p>
            Our mission is to provide a seamless and efficient experience for all users, ensuring that education management is simple and effective.
          </p>
        </section>
      </main>
    </div>
  );
};

export default About;
