<?php
//var_dump($row_sdata);
//echo $row_sdata['staff_no']; die();
?>
<!-- CREATE & UPDATE FORM -->
<style>
    select {
        display: block !important;
    }
</style>
<h5 class="theme-cutomizer-title red lighten-4 pt-2 pr-2 pl-2 pb-3 mt-10 circle-rounded white-text text-darken-4 gradient-45deg-indigo-blue box-shadow-none border-round center">PROCUREMENT ASSIGN</h5>

<form class="mb-5 mt-5" name="endorse_adviser1" action="endorse_adviser1" method="post">
    <div class="row ">
        <div class="input-field col s12">

        </div>
        <?= 'STAFF NAME : ' . $row_sdata['name']; ?>


        <div class="card hoverable animate fadeLeft">
            <div class="card-content">
                <ul class="collection">
                    <li class="collection-item">
                        <h6><b>ASSIGN STAFF TO MAKE PROCUREMENT REQUEST</b></h6>
                    </li>
                </ul>
            </div>
        </div>
        <p style="color: red;">ARE YOU SURE YOU WANT TO ASSIGN <?= strtoupper($row_sdata['name']) ?> TO MAKE PROCUREMENT REQUEST? </p>
        <div class="card-action pl-0 pr-0 center-align">
            <button class="btn-small waves-effect waves-light gradient-45deg-indigo-blue" id="save-leave"><b>YES</b></button>
            <!-- <button class="btn-small waves-effect waves-light light-red darken-3" type="button"><b>NO</b></button> -->
            <button type="button" class="btn-small waves-effect waves-light red darken-3 sidenav-close" style="height:25px;font-size:15px;line-height:10px"><b>X</b></button>
            <input type="hidden" name="unit_id" value="<?= $row_sdata['unit_id'] ?>" />
            <input type="hidden" name="sno" value="<?= $row_sdata['staff_no'] ?>" />
        </div>
        <?php //else : 
        ?>
        <!-- <div class="card hoverable animate fadeLeft">
              <div class="card-content">
                <ul class="collection">
                  <li class="collection-item">
                    <p><b>APPLIED, AWAITING APPROVAL</b></p>
                  </li>
                </ul>
              </div>
            </div> -->
        <?php //endif; 
        ?>
    </div>

</form>




<!-- RECORD VIEW -->


<!-- </div> -->

<script src="../../public/js/main.js"></script>