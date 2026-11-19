<?php
// var_dump($data2);
//var_dump($data2);
//echo $row_sdata['staff_no']; 
//die();
?>
<!-- CREATE & UPDATE FORM -->
<style>
    .card {
        background: #fff;
        transition: .5s;
        border: 0;
        margin-bottom: 30px;
        border-radius: .55rem;
        position: relative;
        width: 100%;
        box-shadow: 0 1px 2px 0 rgb(0 0 0 / 10%);
    }

    .chat-app .people-list {
        width: 280px;
        position: absolute;
        left: 0;
        top: 0;
        padding: 20px;
        z-index: 7
    }

    .people-list {
        -moz-transition: .5s;
        -o-transition: .5s;
        -webkit-transition: .5s;
        transition: .5s
    }

    .people-list img {
        float: left;
        border-radius: 50%
    }

    .people-list .about {
        float: left;
        padding-left: 8px
    }

    .chat .chat-header {
        padding: 15px 20px;
        border-bottom: 2px solid #f4f7f6
    }

    .chat .chat-header img {
        /* float: left; */
        border-radius: 40px;
        width: 40px
    }

    .chat .chat-header .chat-about {
        /* float: left; */
        padding-left: 10px
    }

    .chat .chat-history {
        padding: 20px;
        border-bottom: 2px solid #fff
    }

    .chat .chat-history ul {
        padding: 0
    }

    .chat .chat-history ul li {
        list-style: none;
        margin-bottom: 30px
    }

    .chat .chat-history ul li:last-child {
        margin-bottom: 0px
    }

    .chat .chat-history .message-data {
        margin-bottom: 15px
    }

    .chat .chat-history .message-data img {
        border-radius: 40px;
        width: 40px
    }

    .chat .chat-history .message-data-time {
        color: #434651;
        padding-left: 6px
    }

    .chat .chat-history .message {
        color: #444;
        padding: 18px 20px;
        line-height: 26px;
        font-size: 16px;
        border-radius: 7px;
        display: inline-block;
        position: relative
    }

    .chat .chat-history .message:after {
        bottom: 100%;
        left: 7%;
        border: solid transparent;
        content: " ";
        height: 0;
        width: 0;
        position: absolute;
        pointer-events: none;
        border-bottom-color: #fff;
        border-width: 10px;
        margin-left: -10px
    }

    .chat .chat-history .my-message {
        background: #efefef
    }

    .chat .chat-history .my-message:after {
        bottom: 100%;
        left: 30px;
        border: solid transparent;
        content: " ";
        height: 0;
        width: 0;
        position: absolute;
        pointer-events: none;
        border-bottom-color: #efefef;
        border-width: 10px;
        margin-left: -10px
    }

    .chat .chat-history .other-message {
        background: #e8f1f3;
        text-align: right
    }

    .chat .chat-history .other-message:after {
        border-bottom-color: #e8f1f3;
        left: 93%
    }

    .chat .chat-message {
        padding: 20px
    }

    .float-right {
        float: right
    }

    .clearfix:after {
        visibility: hidden;
        display: block;
        font-size: 0;
        content: " ";
        clear: both;
        height: 0
    }

    @media only screen and (max-width: 767px) {
        .chat-app .people-list {
            height: 465px;
            width: 100%;
            overflow-x: auto;
            background: #fff;
            /* left: -400px; */
            display: none
        }

        .chat-app .people-list.open {
            left: 0
        }

        .chat-app .chat {
            margin: 0
        }

        .chat-app .chat .chat-header {
            border-radius: 0.55rem 0.55rem 0 0
        }

        .chat-app .chat-history {
            height: 300px;
            overflow-x: auto
        }
    }

    @media only screen and (min-width: 768px) and (max-width: 992px) {
        .chat-app .chat-list {
            height: 650px;
            overflow-x: auto
        }

        .chat-app .chat-history {
            height: 600px;
            overflow-x: auto
        }
    }

    @media only screen and (min-device-width: 768px) and (max-device-width: 1024px) and (orientation: landscape) and (-webkit-min-device-pixel-ratio: 1) {
        .chat-app .chat-list {
            height: 480px;
            overflow-x: auto
        }

        .chat-app .chat-history {
            height: calc(100vh - 350px);
            overflow-x: auto
        }
    }
</style>
<h5 class="theme-cutomizer-title red lighten-4 pt-2 pr-2 pl-2 pb-3 mt-10 circle-rounded white-text text-darken-4 gradient-45deg-indigo-blue box-shadow-none border-round center">ADVISERS CHAT</h5>
<div class="container">
    <div class="row clearfix">
        <div class="col-lg-12">
            <div class="card chat-app">
                <div class="chat">
                    <div class="chat-header clearfix">
                        <div class="row">
                            <div class="col-lg-12">
                                <a href="javascript:void(0);" data-toggle="modal" data-target="#view_info">
                                    <img src="https://cdn.ucc.edu.gh/photos/?tag=<?php echo $data2[0]['Regno']; ?>" alt="studpic">
                                    <!-- <img src="../../public/images/avatar3.png" alt="avatar"> -->
                                </a>
                                <div class="chat-about">
                                    <h6 class="m-b-0"><?= $data2[0]['Name']; ?></h6>
                                    <small><?= $data2[0]['cellphone'] . ' : ' . $data2[0]['Regno'] . ' : ' . $data2[0]['CGPA']; ?></small>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="chat-history">
                        <ul class="m-b-0">
                            <?php foreach ($message as $mess) : ?>
                                <?php if ($mess['sender_id'] != $staff = $_SESSION['user']['staff_no']) : ?>
                                    <li class="clearfix">
                                        <div class="message-data text-right other-message">
                                            <small><span class="message-data-time"><?= date('D, d-M-Y H:i:s', strtotime($mess['sent_date'])); ?></span></small>
                                            <img src="https://cdn.ucc.edu.gh/photos/?tag=<?php echo $data2[0]['Regno']; ?>" alt="studpic">
                                            <!-- <img src="../../public/images/avatar3.png" alt="avatar"> -->
                                        </div>
                                        <div class="message other-message float-right"> <?= $mess['message'] ?> </div>
                                    </li>
                                <?php else : ?>
                                    <li class="clearfix">
                                        <div class="message-data my-message">
                                            <!-- <img src="https://bootdey.com/img/Content/avatar/avatar7.png" alt="avatar"> -->
                                            <img src="<?= $_SESSION['user']['photo'] ?>" alt="avatar">
                                            <small><span class="message-data-time"><?= date('D, M d Y H:i:s', strtotime($mess['sent_date'])); ?></span></small>
                                        </div>
                                        <div class="message my-message"><?= $mess['message'] ?></div>
                                    </li>
                                <?php endif; ?>
                            <?php endforeach; ?>
                        </ul>
                    </div>
                    <div class="chat-message clearfix">
                        <div class="input-group mb-0">
                            <div class="input-group-prepend">
                                <form class="mb-5 mt-5" name="message_reply" action="message_reply" method="post">
                                    <!-- <form class="form repmesform" method="POST" id="repmesform"> -->
                                    <div class="row">
                                        <div class="col s9">
                                            <input type="text" name="message" class="form-control" placeholder="Enter message here...">
                                        </div>
                                        <div class="col s3 mt-3" style="margin-left: -25px;">
                                            <button class="waves-effect waves-light btn gradient-45deg-indigo-blue btn-small" id="save-leave">
                                                <span class="input-group-text"><i class="material-icons">send</i></span></button>
                                        </div>
                                    </div>
                                    <input type="hidden" name="studid" value="<?= $data2[0]['studid']; ?>" />
                                    <input type="hidden" name="add_id" value="<?= $data1[0]['id']; ?>" />
                                </form>

                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>




<!-- RECORD VIEW -->


<!-- </div> -->

<script src="../../public/js/main.js"></script>