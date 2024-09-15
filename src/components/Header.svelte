<script lang="ts">
  // No props needed
</script>

<header>
  <div class="logo">
    <button class="menu-toggle" aria-label="Toggle menu">
 
    </button>
    <img src="/images/profile.png" alt="Profile" class="profile-icon">
    <img src="/images/logo.svg" alt="Logo" class="logo-image">
  </div>
  <nav>
    <!-- Add your navigation items here -->
  </nav>
</header>

<style>
  header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem 2rem;
  }

  .logo {
    display: flex;
    align-items: center;
  }

  .profile-icon {
    width: 45px; /* Increased from 30px to 45px (50% larger) */
    height: 45px; /* Increased from 30px to 45px (50% larger) */
    border-radius: 50%;
    margin-right: 0.75rem; /* Slightly increased margin */
    object-fit: cover;
  }

  .logo-image {
    height: 40px; /* Kept the same as before */
    width: auto;
  }

  @media (max-width: 768px) {
    .menu-toggle,
    .profile-icon,
    .logo-image {
      display: none;
    }

    nav {
      display: none;
    }
  }

  nav a {
    text-decoration: none;
    color: #333;
    font-weight: bold;
  }

  .menu-toggle {
    display: none;
    background: none;
    border: none;
    cursor: pointer;
    padding: 0;
  }

  .burger-icon {
    display: block;
    width: 30px;
    height: 3px;
    background-color: #333;
    position: relative;
    transition: background-color 0.3s;
  }

  .burger-icon::before,
  .burger-icon::after {
    content: '';
    position: absolute;
    width: 100%;
    height: 3px;
    background-color: #333;
    transition: transform 0.3s;
  }

  .burger-icon::before {
    top: -8px;
  }

  .burger-icon::after {
    bottom: -8px;
  }

  @media (max-width: 768px) {
    .menu-toggle {
      display: block;
    }

    .profile-icon,
    .logo-image {
      display: none;
    }

    nav {
      display: none;
    }

    nav.open {
      display: block;
    }
  }
</style>
