<script lang="ts">
    // Remove the name prop if it's no longer needed
    // export let name: string;

    let language: 'EN' | 'FR' = 'EN';

    function toggleLanguage() {
        language = language === 'EN' ? 'FR' : 'EN';
    }

    const socialIcons = [
        { name: 'imdb', url: 'https://m.imdb.com/name/nm16175751/?ref_=ext_shr_lnk', icon: '/images/icons/imdb.svg' },
        { name: 'linkedin', url: 'https://www.linkedin.com/in/kat-rollinson-323942231', icon: '/images/icons/linkedin.svg' },
        { name: 'stage32', url: 'https://www.stage32.com/profile/851138/about', icon: '/images/icons/stage32.svg' },
        { name: 'instagram', url: 'https://www.instagram.com/kat_writes_whataline', icon: '/images/icons/instagram.svg' },
        { name: 'email', url: 'mailto:Kat_writes@whataline.com ', icon: '/images/icons/email.svg' },
        
    ];
</script>

<div class="profile-container">
    <div class="diagonal-background"></div>
    <div class="content">
        <div class="left-content">
            <p class="description">
                Screenwriter, script supervisor, and filmmaker.
            </p>
            <div class="social-icons">
                {#each socialIcons as icon}
                    <a href={icon.url} aria-label={icon.name}>
                        <img src={icon.icon} alt={icon.name} />
                    </a>
                {/each}
            </div>
        </div>
        <div class="profile-image-container">
            <div class="profile-image">
                <img src="/images/profile.png" alt="Katherine Rollinson">
            </div>
        </div>
        <div class="right-content">
            <img src="./images/logo.svg" alt="Logo" class="logo-image">
            <p class="subtitle">Katherine Rollinson</p>
        </div>
    </div>
</div>

<div class="language-toggle">
    <button class:active={language === 'EN'} on:click={toggleLanguage}>EN</button>
</div>

<style>
    .profile-container {
        position: relative;
        margin-top: 4rem;
        padding: 2rem;
        overflow: hidden;
    }

    .diagonal-background {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: linear-gradient(to bottom right, white 50%, #b3dade 50%);
        transform: skewY(-5deg);
        transform-origin: top left;
        z-index: -1;
    }

    .content {
        display: flex;
        align-items: center;
        justify-content: space-between;
        position: relative;
        z-index: 1;
    }

    .left-content, .right-content {
        flex: 1;
        max-width: 30%;
    }

    .profile-image-container {
        flex: 1;
        display: flex;
        justify-content: center;
        align-items: center;
    }

    .profile-image {
        width: 300px;
        height: 300px;
    }

    .profile-image img {
        width: 100%;
        height: 100%;
        border-radius: 50%;
        object-fit: cover;
    }

    .logo-image {
        max-width: 100%;
        height: auto;
        margin-bottom: 0.25rem;
    }

    h1 {
        font-size: 3.5rem;
        font-weight: bold;
        margin-bottom: 0.25rem;
        line-height: 1.2;
    }

    .subtitle {
        color: #666;
        margin-bottom: 1.5rem;
        font-size: 1.375rem; /* Increased from 1.1rem to 1.375rem (25% larger) */
        line-height: 1.3; /* Adjusted line height for better readability */
    }

    .description {
        font-size: 1.1rem;
        margin-bottom: 1.5rem;
        line-height: 1.6;
    }

    .social-icons {
        display: flex;
        gap: 1rem;
    }

    .social-icons a {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 24px;
        height: 24px;
    }

    .social-icons img {
        width: 100%;
        height: 100%;
        object-fit: contain;
    }

    .profile-image-container {
        flex: 1;
        display: flex;
        justify-content: center;
        align-items: center;
        background-color: white; /* Added to create contrast with the new background */
        padding: 1rem;
        border-radius: 50%;
    }

    .profile-image {
        width: 300px;
        height: 300px;
    }

    .profile-image img {
        width: 100%;
        height: 100%;
        border-radius: 50%;
        object-fit: cover;
    }

    .language-toggle {
        position: fixed;
        bottom: 1rem;
        right: 1rem;
        display: flex;
        gap: 0.5rem;
    }

    .language-toggle button {
        padding: 0.5rem 1rem;
        background-color: white;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        transition: background-color 0.3s ease;
    }

    .language-toggle button.active {
        background-color: #b3dade;
        color: white;
    }
</style>



