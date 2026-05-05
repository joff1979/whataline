<script>
  const currentYear = new Date().getFullYear();
</script>

<footer>
  <div class="container">
    <p>&copy; {currentYear} Katherine Rollinson - Kat_writes@whataline.com . All rights reserved.</p>
    <nav>
      <ul>
      </ul>
    </nav>
  </div>
</footer>

<style>
  footer {
    background-color: #f8f9fa;
    padding: 1rem 0;
    margin-top: 2rem;
  }

  .container {
    padding: 0 1rem;
    display: flex;
    justify-content: flex-end;
    align-items: center;
    font-family: "Amaranth";
    font-weight: 400;
    font-style: normal;
  }

  p {
    margin: 0;
  }

  ul {
    list-style-type: none;
    padding: 0;
    margin: 0;
    display: flex;
  }

  li {
    margin-left: 1rem;
  }

  a {
    color: #333;
    text-decoration: none;
  }

  a:hover {
    text-decoration: underline;
  }
</style>
