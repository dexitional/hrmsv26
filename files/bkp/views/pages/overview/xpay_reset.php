<!-- Materialize CSS Password Reset Section -->
<section class="section">
    <div class="container">
        <div class="row" style="margin-top:50px;">
            
            <div class="col s12 m3"></div>

            <div class="col s12 m6">
                <div class="card">
                    <div class="card-content">
                        <span class="card-title center-align">
                            <h5>Xpay Password Reset</h5>
                        </span>
                        <?php if (isset($flash['success'])): ?>
                            <div class="card-panel green white-text">
                                <?= $flash['success']; ?>
                                <br>
                                <a href="https://xpay.ucc.edu.gh" class="white-text">Click here to Go to XPay</a>
                            </div>
                        <?php endif; ?>

                        <?php if (isset($flash['error'])): ?>
                            <div class="card-panel red white-text">
                                <?= $flash['error']; ?>
                            </div>
                        <?php endif; ?>
                        

                        <div class="grey lighten-3" style="padding:20px; border-radius:8px;">
                            <form method="post" action="xpayreset" name="xpayreset" id="xpayreset">

                                <!-- Alert Message -->
                                <div class="center-align">
                                    <?php if (!empty($data1['message'])) : ?>
                                        <div class="card-panel <?= (($data1['status'] == 'error') ? 'red lighten-2 white-text' : 'green lighten-2 white-text') ?>">
                                            <i class="material-icons left">notifications</i>
                                            <b><?= $data1['message'] ?></b>
                                        </div>
                                    <?php endif; ?>
                                </div>

                                <!-- Username Display -->
                                <div class="center-align">
                                    <?php
                                        $exemail1 = explode('@', $_SESSION['user']['ucc_mail']);
                                    ?>
                                    <p><strong>Username:</strong> <?= (empty($exemail[0]) ? $exemail1[0] : $exemail[0]); ?></p>
                                </div>

                                <input type="hidden" name="username" 
                                       value="<?= (empty($exemail[0]) ? $exemail1[0] : $exemail[0]); ?>">

                                <!-- New Password -->
                                <div class="input-field">
                                    <input type="password" name="npass" id="npass" required>
                                    <label for="npass">New Password (Eg: @password1234)</label>
                                </div>

                                <!-- Retype Password -->
                                <div class="input-field">
                                    <input type="password" name="rnpass" id="rnpass" required>
                                    <label for="rnpass">Retype New Password (Eg: @password1234)</label>
                                </div>

                                <!-- Submit Button -->
                                <div class="center-align">
                                    <button type="submit" class="btn red darken-2 waves-effect waves-light btn-large">
                                        Reset
                                    </button>
                                </div>

                            </form>

                        </div>
                    </div>
                </div>
            </div>

            <div class="col s12 m3"></div>

        </div>
    </div>
</section>
