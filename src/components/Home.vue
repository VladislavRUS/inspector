<template>
    <div class="wrapper">
        <div class="container">
                <header class="header">
                    <div class="header__title">
                            Inspector
                    </div>
                    <router-link to="/upload" class="header__button">
                        Go to app
                    </router-link>
                </header>
                <div class="content">
                    <div class="content__header">
                        View and inspect PSD files across browsers and operating systems
                    </div>
                    <div class="content__subheader">
                        Completely free. No registration required
                    </div>
                    <div class="content__image">
                        <img src="../assets/laptop.png">
                    </div>
                </div>
            </div>
    </div>
</template>

<script>
export default {
  name: 'Home',
};
</script>

<style scoped lang="less">
.wrapper {
  width: 100%;
  height: 100vh;
  background: linear-gradient(
    135deg,
    rgba(60, 8, 118, 0.8) 0%,
    rgba(250, 0, 118, 0.8) 100%
  );
}
.container {
  margin: 0 auto;
  max-width: 1200px;
  height: 100%;
}

.header {
  display: flex;
  align-items: center;
  padding: 20px;

  &__title {
    font-size: 36px;
    font-weight: 300;
    color: #fff;
  }

  &__button {
    padding: 5px 10px;
    margin-left: auto;
    border: 2px solid white;
    border-radius: 10px;
    font-size: 16px;
    color: #fff;
    text-transform: uppercase;
    cursor: pointer;
    transition: background-color 0.2s ease;
    text-decoration: none;
    outline: none;

    &:hover {
      background-color: #fff;
      color: #ce3592;
    }
  }
}

.content {
  padding: 20px;
  margin-top: 50px;
  display: flex;
  justify-content: flex-start;
  align-items: center;
  flex-direction: column;

  @media screen and (max-width: 320px) {
    margin-top: 10px;
  }

  &__header {
    margin-bottom: 20px;
    max-width: 700px;
    font-size: 50px;
    font-weight: 300;
    color: #fff;
    text-align: center;
    line-height: 1.2;

    @media screen and (max-width: 960px) {
      font-size: 34px;
    }

    @media screen and (max-width: 320px) {
      font-size: 18px;
    }
  }

  &__subheader {
    margin-bottom: 20px;
    font-size: 24px;
    color: #ffb8f6;
    text-align: center;
    @media screen and (max-width: 960px) {
      font-size: 16px;
    }
  }

  &__image {
    max-width: 600px;

    @media screen and (max-width: 960px) {
      max-width: 400px;
    }
  }
}
</style>
