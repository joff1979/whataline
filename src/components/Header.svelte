<script lang="ts">
  // No props needed
</script>

<header>
  <div class="logo">
    <img src="/images/profile.png" alt="Profile" class="profile-icon">
    <img src="/images/logo.svg" alt="Logo" class="logo-image">
  </div>
  <nav>
    <!--<a href="#blog">BLOG</a> -->
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

  nav a {
    text-decoration: none;
    color: #333;
    font-weight: bold;
  }
</style>
