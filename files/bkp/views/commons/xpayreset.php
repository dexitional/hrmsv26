<?php
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

var_dump($_SESSION);
// include 'xssh.php';

// $ssh = ssh2_connect('192.168.0.23');
// ssh2_auth_password($ssh, 'root', '$p@D0s!23!');
// $stream = ssh2_tunnel($ssh, '192.168.0.23', 3306);
// $link = new MysqlStreamDriver($stream, 'rgyamfi', '!Xpay123', 'uexpay');
// $link->query('SELECT * FROM ...')->fetch_assoc();
session_start();

var_dump($_SESSION['ucc_mail']);

if(isset($_SESSION['ucc_mail'])){

$dbhost = '192.168.0.23';
$dbuser = 'rgyamfi';
$dbpass = '!Xpay123';
$dbname = 'uexpay';
$connection = new mysqli($dbhost, $dbuser, $dbpass, $dbname);
if (!$connection) {
    echo "false";
} else {
    echo "true";
}

$email = $_GET['email'];
$exemail = explode('@', $email);
// var_dump($_SESSION);
if (!empty($_GET['email'])) {
    $_SESSION['xpayemail'] = $email;
    $exemail1 = explode('@', $_SESSION['xpayemail']);
}

if (isset($_SESSION['xpayemail'])) {
    $exemail1 = explode('@', $_SESSION['xpayemail']);
}

if ($_POST) {
    $username = trim($_POST['username']);
    $npass = trim($_POST['npass']);
    $rnpass = trim($_POST['rnpass']);
    // var_dump($_POST);
    if (empty($npass) || empty($rnpass)) {
        $data1 = [
            'status' => 'error',
            'message' => 'Enter New Password!!!'
        ];
    } elseif ($npass != $rnpass) {
        $data1 = [
            'status' => 'error',
            'message' => 'New Password And Re-Enter Password Does Not Match!!!'
        ];
    } else {
        // $password = trim($_POST['npass']);
        $password = password_hash($npass, PASSWORD_DEFAULT);
        // echo $password;
        $que = "SELECT * from uexpay.auth_user where username = '$username'";
        // $que = "UPDATE uexpay.auth_user SET password='$password' where username = '$username'";
        // echo $que;
        $qry = $link->query($que);
        // $qry = $connection->query($que);
        // var_dump($qry);
        // die();
        if ($qry) {
            $data1 = [
                'status' => 'success',
                'message' => 'Your password has been updated successfully!!!'
            ];
        } else {
            $data1 = [
                'status' => 'error',
                'message' => 'Error updating password please try again!!!'
            ];
            // echo 'errr: '.mysql_error($connection);
        }
    }
}


?>

<!DOCTYPE html>
<html>

<head>
    <link rel="stylesheet" href="public/plugins/bootstrap/css/bootstrap.min.css">
    <title>XPay Password Reset</title>
</head>

<body>

    <div class="container">
        <div class="row mt-5">
            <div class="col-3"></div>
            <div class="col-6">
                <div class="card">
                    <div class="card-header">
                        <h3>Xpay Password Reset</h3>
                    </div>
                    <div class="card-body bg-secondary">
                        <form method="post" action="xpayreset.php">
                            <div class="text-center">
                                <?php if (!empty($data1['message'])) : ?>
                                    <div class="alert <?= (($data1['status'] == 'error') ? 'alert-danger' : 'alert-success') ?>" role="alert">
                                        <i class="ti-bell"></i>
                                        <b><?= $data1['message'] ?></b>
                                        <button type="button" class="close" data-dismiss="alert" aria-label="Close">
                                            <span aria-hidden="true">&times;</span> </button>
                                    </div>
                                <?php endif; ?>
                            </div>
                            <div class="text-center">
                                <p>Username: <?= (empty($exemail[0]) ? $exemail1[0] : $exemail[0]); ?></p>
                            </div>
                            <input type="hidden" name="username" value="<?= (empty($exemail[0]) ? $exemail1[0] : $exemail[0]); ?>">
                            <div class="form-group">
                                <label>New Password</label>
                                <input type="password" name="npass" placeholder="Eg: @password1234" class="form-control">
                            </div>
                            <div class="form-group">
                                <label>Retype New Password</label>
                                <input type="password" name="rnpass" placeholder="Eg: @password1234" class="form-control">
                            </div>
                            <button type="submit" class="btn btn-danger btn-block">Reset</button>
                        </form>
                    </div>
                </div>
            </div>
            <div class="col-3"></div>
        </div>
    </div>

    <script src="public/js/bootstrap-min.js"></script>
</body>

</html>
<?php
} else {
    echo "Session Expired. Please try again.";
}?>