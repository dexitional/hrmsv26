
<!DOCTYPE>
<html lang="en">
<head>
    <title>UNIT LIST</title>
    <link href="http://www.allfont.de/allfont.css?fonts=arial-narrow" rel="stylesheet" type="text/css" />
    <script src="//ajax.googleapis.com/ajax/libs/jquery/2.2.4/jquery.min.js"> </script> 
    <script src="//cdn.rawgit.com/rainabba/jquery-table2excel/1.1.0/dist/jquery.table2excel.min.js"></script> 
    <script>
        $(document).ready(function() {
           // Export to Excel
           $('#excel').on('click',function(){
              $("#memlist").table2excel({
                  exclude: ".noexp",
                  filename: "<?= strtolower($rows[0]['long_name'])?>.xls",
              });
           })
           
        });
    </script>
    <style type="text/css" >
          body{
            background-color:#eee;              
          }

          .cover{
              width: 1024px;            
              margin: 10px auto;  
              box-shadow:2px 2px 4px #999;
              padding:20px 35px; 
              background:#fff;           
          }

          .title{
              text-align: center;
              font-size:34px;
              color: rgb(8, 8, 148); 
          }

          .subtitle{
              font-family: 'Franklin Gothic Medium', 'Arial Narrow', Arial, sans-serif;
              font-weight:bolder;
              text-align: center;
              font-size:25px;
              word-spacing:0.5em;
              color: red;
              font-style:italic;
              margin-top:-15px;
          }

          .subnote{
             position: relative;
             height:60px;             
          }

          .cover_adds{
              position:absolute;
              left:0;
              top:0; 
              font-size:12px;
              color:rgb(8, 8, 148); 
              line-height:18px;           
          }

         .ucc_title{
              position:absolute;
              right:0;
              top:0; 
              text-align:right; 
              font-size:18px;
              line-height:25px;
              word-spacing:0.35em;
              font-weight:bold;                         
          }
          .ucc_logo{
            position:absolute;
            left:44.9%;
            top:0;   
            height: 100px;  
            width: 90px;                 
          }

          content{
              font-family:'Arial Narrow', Arial, sans-serif;
              font-size: 17px;
              display:block;
              padding-top: 50px;
          }

          address{
              font-style:normal;
          }

          .signatory{
              width:200px;
              height:130px;
              background-image:url(/public/images/logo-170x172.png);
              background-repeat: no-repeat;             
              background-position: 0% 0%;
              background-size: 200px 65px;
              position: relative;
          }

          .signer{
              position:absolute;
              left:0;
              bottom:0;
          }

          .salute{
              margin-top:20px;
          }

          .ref{
              margin-bottom:20px;
          }

          .end{
              position:relative;              
          }

          .copies{
              position: absolute;
              right:25%;
              top: 0;
          }

          footer{
              margin:80px 0 10px;
              font-size:10px;
              font-family:cursive;
              font-style:italic;
          }

          .heading{
              text-align:center;
              background:#b80924;
              color:#fff;
              padding:10px 5px 10px 60px;
              /*text-indent: 80px;*/
          }

          .table{
              border-collapse: collapse;
              width: 100%;
              border:thin solid #000;
              padding: 20px;
              vertical-align:middle;
              text-align:center;
          }

          .table tr{
              border-bottom: thin solid #000;             
          }

          .table td{
              border-right: thin solid #000;
              padding: 10px;            
          }

          .certv{
              text-align:center;
          }

          .vbtn{
              padding:5px;
              margin-top:-20px;
              text-decoration:none;
              font-size:10px;
              background-color:green;
              color:#fff;
              position:relative;
              top:-10px;
              border-radius:10px;
          }

          .sbody{
              font-weight:600;
              font-size:15px;
              display:inline-block;
          }

          .file_photo{
              display:block;
              height:120px;
              right:0;
              float:right;
              margin:-25px 15px 10px 0;
              padding:2px;
              border:3px solid #b80924;
              border-radius:10px;
              background-color:#f1f2f3;
          }

          .marital{
              padding:5px;
              margin-top:-20px;             
              font-size:15px;
              font-weight:bolder;
              background-color:#b80924;
              text-decoration:none;
              color:#fff;
              position:relative;
              top:1px;              
          }

         .staff_no{
              padding:5px;
              margin-top:-20px;             
              font-size:15px;
              font-weight:bolder;
              letter-spacing:0.8em;
              background-color:#0d2d62;
              text-decoration:none;
              color:#fff;
              position:relative;
              top:1px;              
          }

          .print_cover{
              clear:both;
              position:relative;
              top:50px;
          }


          @media print {
              body{
                  background:none;
              }

              .cover{
                  padding:0;
                  background:none;
                  box-shadow:none;
              }

              .vbtn{
                  display:none;
              }

            .print_cover{
                 display:none;
             }

             table{
                width: 97%; 
                margin: 0 10px 10px 0; 
                float: none;
                /*page-break-inside:avoid*/
             }
          }

         
    </style>
</head>
<body>
    <div class="cover">
          <header>
              <h1 class="title">UNIVERSITY OF CAPE COAST</h1>
              <h2 class="subtitle">DIRECTORATE OF HUMAN RESOURCE</h2>              
              <div class="subnote">
                    <div class="cover_adds">
                        <dl class="note">
                            <dt>Cellphone:  <div style="display:inline-block;vertical-align:top;font-weight:bold;">+233-3321-32480/3 Exts.: 223/225/205<br>233-3321-32484/5</div></dt>
                            <dt>E-mail:&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<div style="display:inline-block;vertical-align:top;font-weight:bold;">dhr.enquiries@ucc.edu.gh</div></dt>
                            <dt>Website:&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<div style="display:inline-block;vertical-align:top;font-weight:bold;">www.ucc.edu.gh</div></dt>                   
                        </dl>                       
                    </div>
                
                  
                  <img src="/public/images/logo/logo.png" alt="UCC LOGO" class="ucc_logo"/>
                  <address class="ucc_title">
                          UNIVERSITY POST OFFICE<br/>
                          CAPE COAST, GHANA
                  </address>
                  <div class="print_cover">
                        <button type="button" class="print" style="background:brown;font-weight:bolder;border:none;color:#fff;padding:5px 15px; margin:10px 3px;float:right;cursor:pointer;outline:none;" onclick="return window.print();">PRINT</button>
                        <button type="button" id="excel" style="background:rgb(8, 8, 148);font-weight:bolder;border:none;color:#fff;padding:5px 15px; margin:10px 3px;float:right;cursor:pointer;outline:none;">EXCEL EXPORT</button>
                  </div>
              </div>
              
          </header>  
          <content>
                
              <div class="content">
                    <h2 class="heading"><?= strtoupper($rows[0]['long_name']); ?> </h2>          
                   <table class="table" id="memlist" style="background:pink;color:darkred"> 
                        <tr>
                            <th>STAFF NO.</th>
                            <th>FULL NAME</th>
                            <th>PHONE</th>
                            <th>EMAIL</th>
                            <th>DESIGNATION</th>
                            <th class="noexp">PHOTO</th>                                        
                        </tr> 
                        <?php 
                            foreach($rows as $row){
                        ?>                            
                        <tr style="background:#f8f9fa">
                            <td><b><?= $row['staff_no']?></b></td>
                            <td align="left"><b><?= $row['name']; ?></b></td>
                            <td align="left"><?= $row['phone']; ?></td>
                            <td align="left"><?= $row['ucc_mail']; ?></td>
                            <td align="left"><small><?= $row['title']; ?></small></td>
                            <td class="noexp">
                                <?= $row['photo'] == null ? '<img src="/public/images/profile_img.png" height="80px"/>':'<img src="'.$_SESSION['settings']['assethost'].substr($row['photo'],7).'" height="80px"/>' ?>
                            </td>                                       
                        </tr>
                        <?php } ?>
                    
                  </table>
             </div>              
          </content>
          <footer>
              <span><?= strtoupper($rows[0]['long_name']); ?></span>
          </footer>        
    </div>
</body>
</html>