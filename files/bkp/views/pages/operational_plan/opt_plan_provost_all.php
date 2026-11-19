<script src="https://cdn.tailwindcss.com"></script>
<div>
  <?php
    if (count($opt) > 0) {
        $i = 1;
        // foreach ($data['opt'] as $opt_plan) {
            // foreach ($opt as $opt_plan) {
  ?>
  <?php
    foreach ($opt as $opt_plan) :
        // var_dump($opt);die();
        $q_data = explode(':', $opt_plan['optplan']);
        $i = 1;
    ?>
    <h3 class="mt-3"> <?php echo $opt_plan['long_name']?></h3>
    <?php foreach ($q_data as $questions) :
        
        $opt_plan3 = explode('|', $questions);
        // var_dump(    $opt_plan3);
        // var_dump($opt_plan3[24]);
        // die();
        ?>
    <div class="w-full bg-white h-fit flex p-4 divide-x mb-1">
    <!-- <section id="id-section" class="w-1/12">
    <span class="text-blue-900">  O<?php //echo $i++; ?></span>
      
    </section> -->
    <section class="w-11/12 px-1 flex-col">
   

      <section id="objectives">

<section id="main_title" class="bg-blue-50 text-blue-900 p-2 text-lg font-bold text-uppercase">
  Objectives <?= $i++; ?>
</section>
<section id="elements" class="flex gap-2 divide-x  overflow-x-auto">
  <div id="elements-content" class="flex-col p-1">
    <div id="title" class="font-bold text-blue-900 text-nowrap text-xs  text-uppercase">
      Project Summary
    </div>
    <div id="content">
      <?= $opt_plan3['6'] ?? '' ?>
    </div>
  </div>
  <div id="elements-content" class="flex-col p-1">
    <div id="title" class="font-bold text-blue-900 text-nowrap text-xs  text-uppercase">
      Performance Indicators
    </div>
    <div id="content" class="overflow-auto">
      <?= $opt_plan3['7'] ?? '' ?>
    </div>
  </div>
  <div id="elements-content" class="flex-col p-1">
    <div id="title" class="font-bold text-blue-900 text-nowrap text-xs text-uppercase">
    Link To UCSP
    </div>
    <div id="content" class="overflow-auto">
      <?= $opt_plan3['9'] ?? '' ?>
    </div>
  </div>
  <div id="elements-content" class="flex-col p-1">
    <div id="title" class="font-bold text-blue-900 text-xs text-nowrap text-uppercase">
      Risk Assumption
    </div>
    <div id="content" class="overflow-auto">
      <?= $opt_plan3['11'] ?? '' ?>
    </div>
  </div>
  <div id="elements-content" class="flex-col p-1">
    <div id="title" class="font-bold text-blue-900 text-xs text-nowrap text-uppercase">
      Responsibility
    </div>
    <div id="content" class="overflow-auto">
      <?= $opt_plan3['5'] ?? '' ?>
    </div>
  </div>
  
  
  <div id="elements-content" class="flex-col p-1">
    <div id="title" class="font-bold text-blue-900 text-xs text-nowrap  text-uppercase">
      Sources & Means
    </div>
    <div id="content" class="overflow-auto">
      <?= $opt_plan3['14'] ?? '' ?>
    </div>
  </div>
  
  

 

</section>
</section>

      <div class="flex">
        <section id="output" class="w-1/2">

          <section id="main_title" class="bg-blue-900 text-blue-50 p-2 text-lg font-bold text-uppercase">
            Output
          </section>
          <section id="elements" class="flex gap-2 divide-x">
            <div id="elements-content" class="flex-col p-1 w-1/2">
              <div id="title" class="font-bold text-blue-900 text-xs  text-uppercase">
                Project Summary
              </div>
              <div id="content">
                <?= $opt_plan3['24'] ?? '' ?>
              </div>
            </div>
            <div id="elements-content" class="flex-col p-1 w-1/2">
              <div id="title" class="font-bold text-blue-900 text-xs  text-uppercase">
                Performance Indicators
              </div>
              <div id="content">
                <?= $opt_plan3['23'] ?? '' ?>
              </div>
            </div>




          </section>

        </section>
        <section id="outcome" class="w-1/2">
          <section id="main_title" class="bg-blue-50 text-blue-900 p-2 text-lg font-bold text-uppercase">
            Outcome
          </section>
          <section id="elements" class="flex gap-2 divide-x">
            <div id="elements-content" class="flex-col p-1 w-1/2">
              <div id="title" class="font-bold text-blue-900 text-xs  text-uppercase">
                Project Summary
              </div>
              <div id="content">
                <?= $opt_plan3['26'] ?? '' ?>
              </div>
            </div>
            <div id="elements-content" class="flex-col p-1 w-1/2">
              <div id="title" class="font-bold text-blue-900 text-xs  text-uppercase">
                Performance Indicators
              </div>
              <div id="content">
                <?= $opt_plan3['25'] ?? '' ?>
              </div>
            </div>




          </section>
        </section>
      </div>

      <section id="impact">

        <section id="main_title" class="bg-blue-50 text-blue-900 p-2 text-lg font-bold text-uppercase">
          Impact
        </section>
        <section id="elements" class="flex gap-2 divide-x">
          <div id="elements-content" class="flex-col p-1 w-1/2">
            <div id="title" class="font-bold text-blue-900 text-xs  text-uppercase">
              Project Summary
            </div>
            <div id="content">
              <?= $opt_plan3['22'] ?? '' ?>
            </div>
          </div>
          <div id="elements-content" class="flex-col p-1 w-1/2">
            <div id="title" class="font-bold text-blue-900 text-xs  text-uppercase">
              Performance Indicators
            </div>
            <div id="content">
              <?= $opt_plan3['21'] ?? '' ?>
            </div>
          </div>




        </section>
      </section>
      <section id="activities">

        <section id="main_title" class="bg-blue-50 text-blue-900 p-2 text-lg font-bold text-uppercase">
          Activities
        </section>
        <section id="elements" class="flex gap-2 divide-x  overflow-x-auto">
          <div id="elements-content" class="flex-col p-1">
            <div id="title" class="font-bold text-blue-900 text-xs text-nowrap  text-uppercase">
              Project Summary
            </div>
            <div id="content">
              <?= $opt_plan3['15'] ?? '' ?>
            </div>
          </div>
          <div id="elements-content" class="flex-col p-1">
            <div id="title" class="font-bold text-blue-900 text-nowrap text-xs  text-uppercase">
              Performance Indicators
            </div>
            <div id="content" class="overflow-auto">
              <?= $opt_plan3['16'] ?? '' ?>
            </div>
          </div>
          <div id="elements-content" class="flex-col p-1">
            <div id="title" class="font-bold text-blue-900 text-nowrap text-xs  text-uppercase">
              Budget Estimated
            </div>
            <div id="content" class="overflow-auto">
              <?= $opt_plan3['17'] ?? '' ?>
            </div>
          </div>
          <div id="elements-content" class="flex-col p-1">
            <div id="title" class="font-bold text-blue-900 text-xs text-nowrap text-uppercase">
              Budget Actual
            </div>
            <div id="content" class="overflow-auto">
              <?= $opt_plan3['18'] ?? '' ?>
            </div>
          </div>
          <div id="elements-content" class="flex-col p-1">
            <div id="title" class="font-bold text-blue-900 text-xs text-nowrap text-uppercase">
              Target Estimated
            </div>
            <div id="content" class="overflow-auto">
              <?= $opt_plan3['20'] ?? '' ?>
            </div>
          </div>
          <div id="elements-content" class="flex-col p-1">
            <div id="title" class="font-bold text-blue-900 text-xs text-nowrap  text-uppercase">
              Target Actual
            </div>
            <div id="content" class="overflow-auto">
              <?= $opt_plan3['19'] ?? '' ?>
            </div>
          </div>
        </section>
      </section>

      <section id="activities">
        <section id="main_title" class="bg-blue-50 text-blue-900 p-2 text-lg font-bold text-uppercase">
          Review
        </section>
        <section id="elements" class="flex gap-2 divide-x  overflow-x-auto">
          <div id="elements-content" class="flex-col p-1">
            <div id="title" class="font-bold text-blue-900 text-xs text-nowrap text-uppercase">
              Status
            </div>
            <div id="content" class="overflow-auto">
              <?= $opt_plan3['31'] ?? '' ?>
            </div>
          </div>
          <div id="elements-content" class="flex-col p-1">
            <div id="title" class="font-bold text-blue-900 text-xs text-nowrap  text-uppercase">
              Opportunities
            </div>
            <div id="content">
              <?= $opt_plan3['27'] ?? '' ?>
            </div>
          </div>
          <div id="elements-content" class="flex-col p-1">
            <div id="title" class="font-bold text-blue-900 text-nowrap text-xs  text-uppercase">
              Challenges
            </div>
            <div id="content" class="overflow-auto">
              <?= $opt_plan3['28'] ?? '' ?>
            </div>
          </div>
          <div id="elements-content" class="flex-col p-1">
            <div id="title" class="font-bold text-blue-900 text-nowrap text-xs  text-uppercase">
              Action Taken
            </div>
            <div id="content" class="overflow-auto">
              <?= $opt_plan3['29'] ?? '' ?>
            </div>
          </div>
          <div id="elements-content" class="flex-col p-1">
            <div id="title" class="font-bold text-blue-900 text-xs text-nowrap text-uppercase">
              Remarks
            </div>
            <div id="content" class="overflow-auto">
              <?= $opt_plan3['30'] ?? '' ?>
            </div>
          </div>
          
        </section>
      </section>
    </section>
    <!-- <section class="w-1/12 px-1">
      <a onclick="Popup=window.open('opt_plan_table/<?= $opt_plan3['0'] ?>','Popup','toolbar=no,location=0,status=no,menubar=yes,scrollbars=yes,resizable=no, width=800,height=1000,left=400,top=250' ).focus(); return false;"
        class='btn waves-effect waves-light chip lighten-5 text-darken-2 blue green-text mr-1 mb-1 right check_list' title="Edit Form" >
        <i class="material-icons">edit</i>
      </a>
    </section> -->
  </div>
  <?php 
endforeach;  
endforeach;  
// }
  
                    }
                    else {
                     
                   
                      
                  
                    ?>
          <div class="bg-blue-100 shadow mt-2 mb-2 text-blue-900 h-16 flex items-center gap-4 justify-center w-full">
                      <p>There are no existing Operational Plans</p>
                      <i class="material-icons">error</i>
          </div>
       <?php }?>               
                    
</div>