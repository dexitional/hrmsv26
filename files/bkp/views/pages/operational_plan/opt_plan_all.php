<script src="https://cdn.jsdelivr.net/npm/alpinejs@3.x.x/dist/cdn.min.js" defer></script>
<script src="https://cdn.tailwindcss.com"></script>
<link href="https://unpkg.com/tailwindcss@^2/dist/tailwind.min.css" rel="stylesheet">
<?php //var_dump($_SESSION['advisers']);
$yr =date('Y');
$review_year = ($yr-1).'/'.$yr;
?>

  

  <div class="">
  <h2>Departments With Operational Plan For <?=$review_year?></h2>

    <?php
      if (count($optdata) > 0) {
        $i = 1;
        foreach ($optdata as $row) {
    ?>

      <div class="flex flex-col">
      <p>No.: <?= $i++; ?></p>
      <a onclick="Popup=window.open('opt_plan_faculty/<?= $row['unit_id'] ?>','Popup','toolbar=no,location=0,status=no,menubar=yes,scrollbars=yes,resizable=no, width=800,height=1000,left=400,top=250' ).focus(); return false;"
        class='flex justify-between hover:font-bold hover:shadow-lg items-center px-4 uppercase border-dashed bg-white h-16 shadow border border-blue-900  rounded w-full  mb-1 mt-1 hover:bg-blue-900 hover:text-white hover:border-white'>
        <span class=""><?= $row['long_name'] ?></span>
        <span class="lowercase"> Click to view <i class="material-icons">visibility</i></span>
        <!-- <i class="fas fa-list me-1"></i> -->
      </a>

      </div>
      
    <?php }
    } ?>
  </div>

