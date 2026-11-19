  <!-- BEGIN: Footer-->

  <footer
      class="page-footer footer footer-static footer-dark gradient-shadow gradient-45deg-indigo-blue navbar-border navbar-shadow">
      <div class="footer-copyright">
          <div class="container"><span>&copy; <?= date('Y') ?> <a href="#" target="_blank">MIS-DICTS</a>, All rights
                  reserved.</span><span class="right hide-on-small-only">Powered by <a
                      href="https://oauth.ucc.edu.gh/">MIS SECTION</a></span></div>
      </div>
  </footer>

  <script src="../../public/js/vendors.min.js"></script>
  <script src="../../public/bundles/libscripts.bundle.js"></script>
  <!-- Lib Scripts Plugin Js ( jquery.v3.2.1, Bootstrap4 js) -->
  <script src="../../public/bundles/vendorscripts.bundle.js"></script> <!-- slimscroll, waves Scripts Plugin Js -->
  <script src="../../public/plugins/dropzone/dropzone.js"></script> <!-- Dropzone Plugin Js -->

  <script src="../../public/bundles/morrisscripts.bundle.js"></script><!-- Morris Plugin Js -->
  <script src="../../public/bundles/jvectormap.bundle.js"></script> <!-- JVectorMap Plugin Js -->
  <script src="../../public/bundles/knob.bundle.js"></script> <!-- Jquery Knob Plugin Js -->
  <script src="../../public/bundles/countTo.bundle.js"></script> <!-- Jquery CountTo Plugin Js -->
  <script src="../../public/bundles/sparkline.bundle.js"></script> <!-- Sparkline Plugin Js -->
  <script src="../../public/bundles/datatablescripts.bundle.js"></script> <!-- Sparkline Plugin Js -->

  <script src="../../public/bundles/mainscripts.bundle.js"></script>
  <script src="../../public/js/pages/tables/jquery-datatable.js"></script> <!-- Sparkline Plugin Js -->
  <script src="../../public/js/pages/index.js"></script>
  <script src="../../public/js/pages/charts/jquery-knob.js"></script>
  <script src="../../public/js/bootstrap-datepicker.js"></script>
  <script src="../../public/js/sweetalert2.js"></script>
  <script src="../../public/js/fileinput.js"></script>
  <script src="../../public/js/init.js"></script>
  <script src="../../public/js/main.js"></script>

  <!-- Left nav scroll (plugins.min.js is not loaded here because libscripts.bundle.js replaces jQuery) -->
  <script>
  (function() {
      var nav = document.querySelector('#slide-out.leftside-navigation');
      if (!nav) return;
      if (typeof PerfectScrollbar !== 'undefined' && window.innerWidth > 992) {
          var navScroll = new PerfectScrollbar(nav, {
              wheelSpeed: 2,
              wheelPropagation: false,
              minScrollbarLength: 20
          });
          // menu items expand/collapse, so recalculate the scroll height afterwards
          $(nav).on('click', '.collapsible-header', function() {
              setTimeout(function() { navScroll.update(); }, 400);
          });
      } else {
          nav.style.overflowY = 'auto';
      }
  })();
  </script>

  <!-- END PAGE LEVEL JS-->
  <script>
// Add the following code if you want the name of the file appear on select
$(".custom-file-input").on("change", function() {
    var fileName = $(this).val().split("\\").pop();
    $(this).siblings(".custom-file-label").addClass("selected").html(fileName);
});

    //   $(document).ready(function () {
    //     $('#position').on('change', function () {
    //         if ($(this).val() === 'other_specfy') {
    //             $('#other_specfy').slideDown();
    //         } else {
    //             $('#other_specfy').slideUp();
    //         }
    //     });

    //     // Optional: Trigger it on page load in case "OTHERS" is already selected
    //     $('#position').trigger('change');
    // });

    $(document).ready(function() {
        $('#positionstudy_mode').on('change', function() {
            if ($(this).val() === 'OTHERS') {
                $('#other_specfypositionstudy_mode').show();
            } else {
                $('#other_specfypositionstudy_mode').hide();
            }
        });

        // Trigger change on page load in case other_specfy is pre-selected
        $('#positionstudy_mode').trigger('change');
    });

$(document).ready(function() {

    var current_fs, next_fs, previous_fs; //fieldsets
    var opacity;
    var current = 1;
    var steps = $("fieldset").length;

    setProgressBar(current);

    $(".next").click(function() {

        current_fs = $(this).parent();
        next_fs = $(this).parent().next();

        //Add Class Active
        $("#progressbar li").eq($("fieldset").index(next_fs)).addClass("active");

        //show the next fieldset
        next_fs.show();
        //hide the current fieldset with style
        current_fs.animate({
            opacity: 0
        }, {
            step: function(now) {
                // for making fielset appear animation
                opacity = 1 - now;

                current_fs.css({
                    'display': 'none',
                    'position': 'relative'
                });
                next_fs.css({
                    'opacity': opacity
                });
            },
            duration: 500
        });
        setProgressBar(++current);
    });

    $(".previous").click(function() {

        current_fs = $(this).parent();
        previous_fs = $(this).parent().prev();

        //Remove class active
        $("#progressbar li").eq($("fieldset").index(current_fs)).removeClass("active");

        //show the previous fieldset
        previous_fs.show();

        //hide the current fieldset with style
        current_fs.animate({
            opacity: 0
        }, {
            step: function(now) {
                // for making fielset appear animation
                opacity = 1 - now;

                current_fs.css({
                    'display': 'none',
                    'position': 'relative'
                });
                previous_fs.css({
                    'opacity': opacity
                });
            },
            duration: 500
        });
        setProgressBar(--current);
    });

    function setProgressBar(curStep) {
        var percent = parseFloat(100 / steps) * curStep;
        percent = percent.toFixed();
        $(".progress-bar")
            .css("width", percent + "%")
    }

    $(".submit").click(function() {
        return false;
    })

});


$(document).ready(function() {
    $('#app_form1').on('submit', function(event) {
        event.preventDefault();
        if (document.getElementById("emp_signed").checked == false) {
            Swal.fire({
                title: '<span class="text-danger font-weight-bold">Error!!!</span>',
                html: '<span class="text-danger">Employee Signed cannot be uncheck</span>',
                showConfirmButton: false,
                width: 300,
                height: 200,
                imageUrl: '/public/images/ucclogo1.png',
                imageWidth: 100,
                imageHeight: 100,
                imageAlt: 'Custom image',
                timer: 3000
            });
        } else {
            Swal.fire({
                html: '<span class="text-danger font-weight-bold"> Are you sure you want to submit?</span>',
                showConfirmButton: true,
                showCancelButton: true,
                width: 500,
                height: 200,
                imageUrl: '/public/images/ucclogo1.png',
                imageWidth: 100,
                imageHeight: 100,
                imageAlt: 'Custom image',
                confirmButtonText: 'Yes!'
            }).then(function(result) {
                if (result.value) {
                    $.ajax({
                        url: "staff_appraisal_update",
                        method: "POST",
                        data: $('#app_form1').serialize(),
                        success: function(data) {
                            console.log(data);
                            var response = JSON.parse(data);
                            console.log(response.status);
                            if (response.status == 'success') {
                                Swal.fire({
                                    title: 'Success!!!',
                                    html: '<span class="text-success">' +
                                        response.message + '</span>',
                                    showConfirmButton: false,
                                    width: 300,
                                    imageUrl: '/public/images/ucclogo1.png',
                                    imageWidth: 100,
                                    imageHeight: 100,
                                    imageAlt: 'Loading image',
                                    timer: 3000
                                }).then(function() {
                                    location.reload();
                                });
                            } else if (response.status == 'error') {
                                Swal.fire({
                                    title: 'Oooops!!!',
                                    html: '<span class="text-danger">' +
                                        response.message + '</span>',
                                    showConfirmButton: false,
                                    width: 300,
                                    imageUrl: '/public/images/ucclogo1.png',
                                    imageWidth: 100,
                                    imageHeight: 100,
                                    imageAlt: 'Loading image',
                                    timer: 3000
                                })
                            }

                        }
                    });
                }
            });
        }
    });
});

$("#approve").on('show.bs.modal', function(event) {
    var button = $(event.relatedTarget);
    var promo_id = button.data('id');
    var promo_stage = button.data('entry');

    var modal = $(this);
    modal.find('.modal-body #promo_id').val(promo_id);
    modal.find('.modal-body #promo_stage').val(promo_stage);
});

$("#return").on('show.bs.modal', function(event) {
    var button = $(event.relatedTarget);
    var promo_id = button.data('id');
    var promo_stage = button.data('entry');

    var modal = $(this);
    modal.find('.modal-body #promo_id').val(promo_id);
    modal.find('.modal-body #promo_stage').val(promo_stage);
});

$("#procure_edit").on('show.bs.modal', function(event) {
    var button = $(event.relatedTarget);
    var promo_id = button.data('id');
    var promo_stage = button.data('entry');

    var modal = $(this);
    modal.find('.modal-body #promo_id').val(promo_id);
    modal.find('.modal-body #promo_stage').val(promo_stage);
});


$(document).ready(function() {
    $('.tndapproval').on('submit', function(event) {
        event.preventDefault();
        var form_data = new FormData(this);
        // var file_data = $("#input-folder-3").fileinput();
        // form_data.append('file', file_data);
        Swal.fire({
            html: '<span class="text-danger font-weight-bold"> Are you sure you want to submit?</span>',
            showConfirmButton: true,
            showCancelButton: true,
            width: 500,
            height: 200,
            imageUrl: '../../public/images/logo/logo.png',
            imageWidth: 100,
            imageHeight: 100,
            imageAlt: 'Custom image',
            confirmButtonText: 'Yes!'
            //   timer: 3000
        }).then(function(result) {
            if (result.value) {
                $.ajax({
                    url: "tndapproval",
                    method: "POST",
                    dataType: 'text',
                    cache: false,
                    contentType: false,
                    processData: false,
                    data: form_data,
                    success: function(data) {
                        console.log(data);
                        var response = JSON.parse(data);
                        console.log(response.status);
                        if (response.status == 'success') {
                            Swal.fire({
                                title: 'Success!!!',
                                html: '<span class="text-success">' +
                                    response.message + '</span>',
                                showConfirmButton: false,
                                width: 300,
                                imageUrl: '../../public/images/logo/logo.png',
                                imageWidth: 100,
                                imageHeight: 100,
                                imageAlt: 'Loading image',
                                timer: 3000
                            }).then(function() {
                                location.reload();
                            });
                        } else if (response.status == 'error') {
                            Swal.fire({
                                title: 'Oooops!!!',
                                html: '<span class="text-danger">' +
                                    response.message + '</span>',
                                showConfirmButton: false,
                                width: 300,
                                imageUrl: '../../public/images/logo/logo.png',
                                imageWidth: 100,
                                imageHeight: 100,
                                imageAlt: 'Loading image',
                                timer: 3000
                            })
                        }

                    }
                });
            }
        });

    });
});


$(document).ready(function() {
    $('.procureapprovaldd').on('submit', function(event) {
        event.preventDefault();
        var form_data = new FormData(this);
        var file_data = $("#input-folder-3").fileinput();
        form_data.append('file', file_data);
        if (document.getElementById("radio1").checked == false && document.getElementById("radio2")
            .checked == false) {
            Swal.fire({
                title: '<span class="text-danger font-weight-bold">Error!!!</span>',
                html: '<span class="text-danger">Select a your reply (Approve/Disapprove)</span>',
                showConfirmButton: false,
                width: 300,
                height: 200,
                imageUrl: '../../public/images/logo/logo.png',
                imageWidth: 100,
                imageHeight: 100,
                imageAlt: 'Custom image',
                timer: 3000
            });
        } else {
            Swal.fire({
                html: '<span class="text-danger font-weight-bold"> Are you sure you want to submit?</span>',
                showConfirmButton: true,
                showCancelButton: true,
                width: 500,
                height: 200,
                imageUrl: '../../public/images/logo/logo.png',
                imageWidth: 100,
                imageHeight: 100,
                imageAlt: 'Custom image',
                confirmButtonText: 'Yes!'
                //   timer: 3000
            }).then(function(result) {
                if (result.value) {
                    $.ajax({
                        url: "procure_aproval",
                        method: "POST",
                        dataType: 'text',
                        cache: false,
                        contentType: false,
                        processData: false,
                        data: form_data,
                        success: function(data) {
                            console.log(data);
                            var response = JSON.parse(data);
                            console.log(response.status);
                            if (response.status == 'success') {
                                Swal.fire({
                                    title: 'Success!!!',
                                    html: '<span class="text-success">' +
                                        response.message + '</span>',
                                    showConfirmButton: false,
                                    width: 300,
                                    imageUrl: '../../public/images/logo/logo.png',
                                    imageWidth: 100,
                                    imageHeight: 100,
                                    imageAlt: 'Loading image',
                                    timer: 3000
                                }).then(function() {
                                    location.reload();
                                });
                                $('.procureapprovaldd')[0].reset();
                            } else if (response.status == 'error') {
                                Swal.fire({
                                    title: 'Oooops!!!',
                                    html: '<span class="text-danger">' +
                                        response.message + '</span>',
                                    showConfirmButton: false,
                                    width: 300,
                                    imageUrl: '../../public/images/logo/logo.png',
                                    imageWidth: 100,
                                    imageHeight: 100,
                                    imageAlt: 'Loading image',
                                    timer: 3000
                                })
                            }

                        }
                    });
                }
            });
        }

    });
});


$(document).ready(function() {
    $('.procurecomments').on('submit', function(event) {
        event.preventDefault();
        var form_data = new FormData(this);
        var file_data = $("#input-folder-3").fileinput();
        form_data.append('file', file_data);
        if ($('#comment').val() == '') {
            Swal.fire({
                title: '<span class="text-danger font-weight-bold">Error!!!</span>',
                html: '<span class="text-danger">Please enter your comment</span>',
                showConfirmButton: false,
                width: 300,
                height: 200,
                imageUrl: '../../public/images/logo/logo.png',
                imageWidth: 100,
                imageHeight: 100,
                imageAlt: 'Custom image',
                timer: 3000
            });
        } else {
            Swal.fire({
                html: '<span class="text-danger font-weight-bold"> Are you sure you want to submit?</span>',
                showConfirmButton: true,
                showCancelButton: true,
                width: 500,
                height: 200,
                imageUrl: '../../public/images/logo/logo.png',
                imageWidth: 100,
                imageHeight: 100,
                imageAlt: 'Custom image',
                confirmButtonText: 'Yes!'
                //   timer: 3000
            }).then(function(result) {
                if (result.value) {
                    $.ajax({
                        url: "procure_aprovalcomment",
                        method: "POST",
                        dataType: 'text',
                        cache: false,
                        contentType: false,
                        processData: false,
                        data: form_data,
                        success: function(data) {
                            console.log(data);
                            var response = JSON.parse(data);
                            console.log(response.status);
                            if (response.status == 'success') {
                                Swal.fire({
                                    title: 'Success!!!',
                                    html: '<span class="text-success">' +
                                        response.message + '</span>',
                                    showConfirmButton: false,
                                    width: 300,
                                    imageUrl: '../../public/images/logo/logo.png',
                                    imageWidth: 100,
                                    imageHeight: 100,
                                    imageAlt: 'Loading image',
                                    timer: 3000
                                }).then(function() {
                                    location.reload();
                                });
                                $('.procurecomments')[0].reset();
                            } else if (response.status == 'error') {
                                Swal.fire({
                                    title: 'Oooops!!!',
                                    html: '<span class="text-danger">' +
                                        response.message + '</span>',
                                    showConfirmButton: false,
                                    width: 300,
                                    imageUrl: '../../public/images/logo/logo.png',
                                    imageWidth: 100,
                                    imageHeight: 100,
                                    imageAlt: 'Loading image',
                                    timer: 3000
                                })
                            }

                        }
                    });
                }
            });
        }

    });
});


$(document).ready(function() {
    $('.uploadfileapproval').on('submit', function(event) {
        event.preventDefault();
        var form_data = new FormData(this);
        var file_data = $("#input-folder-3").fileinput();
        form_data.append('file', file_data);
        if ($('#comment').val() == '') {
            Swal.fire({
                title: '<span class="text-danger font-weight-bold">Error!!!</span>',
                html: '<span class="text-danger">Please enter your comment</span>',
                showConfirmButton: false,
                width: 300,
                height: 200,
                imageUrl: '../../public/images/logo/logo.png',
                imageWidth: 100,
                imageHeight: 100,
                imageAlt: 'Custom image',
                timer: 3000
            });
        } else if (document.getElementById("radio1").checked == false && document.getElementById(
                "radio2").checked == false) {
            Swal.fire({
                title: '<span class="text-danger font-weight-bold">Error!!!</span>',
                html: '<span class="text-danger">Select a your reply (Approve/Disapprove)</span>',
                showConfirmButton: false,
                width: 300,
                height: 200,
                imageUrl: '../../public/images/logo/logo.png',
                imageWidth: 100,
                imageHeight: 100,
                imageAlt: 'Custom image',
                timer: 3000
            });
        } else if (document.getElementById("input-folder-3").files.length == 0) {
            Swal.fire({
                title: '<span class="text-danger font-weight-bold">Error!!!</span>',
                html: '<span class="text-danger">Please upload a file</span>',
                showConfirmButton: false,
                width: 300,
                height: 200,
                imageUrl: '../../public/images/logo/logo.png',
                imageWidth: 100,
                imageHeight: 100,
                imageAlt: 'Custom image',
                timer: 3000
            });
        } else {
            Swal.fire({
                html: '<span class="text-danger font-weight-bold"> Are you sure you want to submit?</span>',
                showConfirmButton: true,
                showCancelButton: true,
                width: 500,
                height: 200,
                imageUrl: '../../public/images/logo/logo.png',
                imageWidth: 100,
                imageHeight: 100,
                imageAlt: 'Custom image',
                confirmButtonText: 'Yes!'
                //   timer: 3000
            }).then(function(result) {
                if (result.value) {
                    $.ajax({
                        url: "promo_aproval",
                        method: "POST",
                        dataType: 'text',
                        cache: false,
                        contentType: false,
                        processData: false,
                        data: form_data,
                        success: function(data) {
                            console.log(data);
                            var response = JSON.parse(data);
                            console.log(response.status);
                            if (response.status == 'success') {
                                Swal.fire({
                                    title: 'Success!!!',
                                    html: '<span class="text-success">' +
                                        response.message + '</span>',
                                    showConfirmButton: false,
                                    width: 300,
                                    imageUrl: '../../public/images/logo/logo.png',
                                    imageWidth: 100,
                                    imageHeight: 100,
                                    imageAlt: 'Loading image',
                                    timer: 3000
                                }).then(function() {
                                    location.reload();
                                });
                            } else if (response.status == 'error') {
                                Swal.fire({
                                    title: 'Oooops!!!',
                                    html: '<span class="text-danger">' +
                                        response.message + '</span>',
                                    showConfirmButton: false,
                                    width: 300,
                                    imageUrl: '../../public/images/logo/logo.png',
                                    imageWidth: 100,
                                    imageHeight: 100,
                                    imageAlt: 'Loading image',
                                    timer: 3000
                                })
                            }

                        }
                    });
                }
            });
        }

    });
});

$(document).ready(function() {
    $('.uploadfilereturn').on('submit', function(event) {
        event.preventDefault();
        var form_data = new FormData(this);
        var file_data = $("#input-folder-3").fileinput();
        form_data.append('file', file_data);
        if ($('#comment1').val() == '') {
            Swal.fire({
                title: '<span class="text-danger font-weight-bold">Error!!!</span>',
                html: '<span class="text-danger">Please enter your comment</span>',
                showConfirmButton: false,
                width: 300,
                height: 200,
                imageUrl: '../../public/images/logo/logo.png',
                imageWidth: 100,
                imageHeight: 100,
                imageAlt: 'Custom image',
                timer: 3000
            });
        } else if (document.getElementById("radio3").checked == false && document.getElementById(
            "radio4").checked == false && document.getElementById("radio5").checked == false 
                && document.getElementById("radio6").checked == false) {
            Swal.fire({
                title: '<span class="text-danger font-weight-bold">Error!!!</span>',
                html: '<span class="text-danger">Select a file applicant should update</span>',
                showConfirmButton: false,
                width: 300,
                height: 200,
                imageUrl: '../../public/images/logo/logo.png',
                imageWidth: 100,
                imageHeight: 100,
                imageAlt: 'Custom image',
                timer: 3000
            });
        } else {
            Swal.fire({
                html: '<span class="text-danger font-weight-bold"> Are you sure you want to submit?</span>',
                showConfirmButton: true,
                showCancelButton: true,
                width: 500,
                height: 200,
                imageUrl: '../../public/images/logo/logo.png',
                imageWidth: 100,
                imageHeight: 100,
                imageAlt: 'Custom image',
                confirmButtonText: 'Yes!'
                //   timer: 3000
            }).then(function(result) {
                if (result.value) {
                    $.ajax({
                        url: "promo_return",
                        method: "POST",
                        dataType: 'text',
                        cache: false,
                        contentType: false,
                        processData: false,
                        data: form_data,
                        success: function(data) {
                            console.log(data);
                            var response = JSON.parse(data);
                            console.log(response.status);
                            if (response.status == 'success') {
                                Swal.fire({
                                    title: 'Success!!!',
                                    html: '<span class="text-success">' +
                                        response.message + '</span>',
                                    showConfirmButton: false,
                                    width: 300,
                                    imageUrl: '../../public/images/logo/logo.png',
                                    imageWidth: 100,
                                    imageHeight: 100,
                                    imageAlt: 'Loading image',
                                    timer: 3000
                                }).then(function() {
                                    location.reload();
                                });
                            } else if (response.status == 'error') {
                                Swal.fire({
                                    title: 'Oooops!!!',
                                    html: '<span class="text-danger">' +
                                        response.message + '</span>',
                                    showConfirmButton: false,
                                    width: 300,
                                    imageUrl: '../../public/images/logo/logo.png',
                                    imageWidth: 100,
                                    imageHeight: 100,
                                    imageAlt: 'Loading image',
                                    timer: 3000
                                })
                            }

                        }
                    });
                }
            });
        }

    });
});

function promo_status(id) {
    var data = id;
    jQuery.ajax({
        url: "modal_status",
        method: "post",
        data: "promo_id=" + data + ',' + '0',
        success: function(data) {
            jQuery('body').append(data);
            jQuery('.status_modal').modal('toggle');
        },
        error: function() {
            alert("Something went wrong");
        }
    });
}

function procure_del(id) {
    var data = id;
    jQuery.ajax({
        url: "del_procurement",
        method: "post",
        data: "procure_id=" + data + ',' + '1',
        success: function(data) {
            location.reload();
        },
        error: function() {
            alert("Something went wrong");
        }
    });
}

function procure_update(id) {
    var desc = $('#procdesc').val();
    var data = id;
    jQuery.ajax({
        url: "del_procurement",
        method: "post",
        data: "procure_id=" + data + ',0,' + desc + ',0',
        success: function(data) {

        },
        error: function() {
            alert("Something went wrong");
        }
    });
}

function procure_update1(id) {
    var quantity = $('#quantity').val();
    var data = id;
    jQuery.ajax({
        url: "del_procurement",
        method: "post",
        data: "procure_id=" + data + ',0,' + quantity + ',1',
        success: function(data) {

        },
        error: function() {
            alert("Something went wrong");
        }
    });
}

function procure_update2(id) {
    var quantity = $('#quantity').val();
    var data = id;
    jQuery.ajax({
        url: "del_procurement",
        method: "post",
        data: "procure_id=" + data + ',0,' + quantity + ',2',
        success: function(data) {

        },
        error: function() {
            alert("Something went wrong");
        }
    });
}

function edustatus(id) {
    var data = id;
    jQuery.ajax({
        url: "eduform",
        method: "post",
        data: "promo_id=" + data + ',' + '4',
        success: function(data) {
            jQuery('body').append(data);
            jQuery('.eduform_modal').modal('toggle');
        },
        error: function() {
            alert("Something went wrong");
        }
    });
}

function promo_statusunit(id) {
    var data = id;
    jQuery.ajax({
        url: "modal_status",
        method: "post",
        data: "promo_id=" + data + ',' + '4',
        success: function(data) {
            jQuery('body').append(data);
            jQuery('.status_modal').modal('toggle');
        },
        error: function() {
            alert("Something went wrong");
        }
    });
}

function procure_statusunit(id) {
    var data = id;
    jQuery.ajax({
        url: "procuremodal_status",
        method: "post",
        data: "promo_id=" + data + ',' + '4',
        success: function(data) {
            jQuery('body').append(data);
            jQuery('.status_modal').modal('toggle');
        },
        error: function() {
            alert("Something went wrong");
        }
    });
}

function procure_edit(id) {
    var data = id;
    jQuery.ajax({
        url: "procuremodal_edit",
        method: "post",
        data: "promo_id=" + data + ',' + '4',
        success: function(data) {
            jQuery('body').append(data);
            jQuery('.status_modal').modal('toggle');
        },
        error: function() {
            alert("Something went wrong");
        }
    });
}

function procuremodal_view(id) {
    var data = id;
    jQuery.ajax({
        url: "procuremodal_view",
        method: "post",
        data: "promo_id=" + data + ',' + '4',
        success: function(data) {
            jQuery('body').append(data);
            jQuery('.status_modal').modal('toggle');
        },
        error: function() {
            alert("Something went wrong");
        }
    });
}

function promo_statusdean(id) {
    var data = id;
    jQuery.ajax({
        url: "modal_status",
        method: "post",
        data: "promo_id=" + data + ',' + '3',
        success: function(data) {
            jQuery('body').append(data);
            jQuery('.status_modal').modal('toggle');
        },
        error: function() {
            alert("Something went wrong");
        }
    });
}

function promo_statusprovost(id) {
    var data = id;
    jQuery.ajax({
        url: "modal_status",
        method: "post",
        data: "promo_id=" + data + ',' + '2',
        success: function(data) {
            jQuery('body').append(data);
            jQuery('.status_modal').modal('toggle');
        },
        error: function() {
            alert("Something went wrong");
        }
    });
}

function tnd_status(id) {
    var data = id;
    jQuery.ajax({
        url: "tndmodal_status",
        method: "post",
        data: "promo_id=" + data,
        success: function(data) {
            jQuery('body').append(data);
            jQuery('.tndstatus_modal').modal('toggle');
        },
        error: function() {
            alert("Something went wrong");
        }
    });
}

function promo_statushr(id) {
    var data = id;
    jQuery.ajax({
        url: "modal_status",
        method: "post",
        data: "promo_id=" + data + ',' + '1',
        success: function(data) {
            jQuery('body').append(data);
            jQuery('.status_modal').modal('toggle');
        },
        error: function() {
            alert("Something went wrong");
        }
    });
}

$(document).ready(function() {
    $("#input-folder-1").fileinput({
        uploadUrl: "/var/www/html/staffportal/public/images/staff_doc/",
        hideThumbnailContent: false // hide image, pdf, text or other content in the thumbnail preview
    });
});
$(document).ready(function() {
    $("#input-folder-2").fileinput({
        uploadUrl: "/var/www/html/staffportal/public/images/staff_doc/",
        hideThumbnailContent: false // hide image, pdf, text or other content in the thumbnail preview
    });
});
$(document).ready(function() {
    $("#input-folder-3").fileinput({
        uploadUrl: "/var/www/html/staffportal/public/images/staff_doc/",
        hideThumbnailContent: false // hide image, pdf, text or other content in the thumbnail preview
    });
});

$(document).ready(function() {
    $("#input-folder-4").fileinput({
        uploadUrl: "/var/www/html/staffportal/public/images/staff_doc/",
        hideThumbnailContent: false // hide image, pdf, text or other content in the thumbnail preview
    });
});

$(document).ready(function() {
    $("#input-folder-5").fileinput({
        uploadUrl: "/var/www/html/staffportal/public/images/staff_doc/",
        hideThumbnailContent: false // hide image, pdf, text or other content in the thumbnail preview
    });
});

$(document).ready(function() {
    $("#input-folder-6").fileinput({
        uploadUrl: "/var/www/html/staffportal/public/images/staff_doc/",
        hideThumbnailContent: false // hide image, pdf, text or other content in the thumbnail preview
    });
});

$("#updatedf2").on('show.bs.modal', function(event) {
    var button = $(event.relatedTarget);
    var promo_id = button.data('id');
    var promo_stage = button.data('entry');

    var modal = $(this);
    modal.find('.modal-body #promo_id').val(promo_id);
    modal.find('.modal-body #promo_stage').val(promo_stage);
})

$("#returnonef").on('show.bs.modal', function(event) {
    var button = $(event.relatedTarget);
    var promo_id = button.data('id');
    var promo_stage = button.data('entry');

    var modal = $(this);
    modal.find('.modal-body #promo_id').val(promo_id);
    modal.find('.modal-body #promo_stage').val(promo_stage);
});

$("#returnonef_app").on('show.bs.modal', function(event) {
    var button = $(event.relatedTarget);
    var promo_id = button.data('id');
    var promo_stage = button.data('entry');

    var modal = $(this);
    modal.find('.modal-body #promo_id').val(promo_id);
    modal.find('.modal-body #promo_stage').val(promo_stage);
});


$("#returnonepp").on('show.bs.modal', function(event) {
    var button = $(event.relatedTarget);
    var promo_id = button.data('id');
    var promo_stage = button.data('entry');

    var modal = $(this);
    modal.find('.modal-body #promo_id').val(promo_id);
    modal.find('.modal-body #promo_stage').val(promo_stage);
});


$(document).ready(function() {
    $('.updatedpffile').on('submit', function(event) {
        event.preventDefault();
        var form_data = new FormData(this);
        var file_data = $("#input-folder-3").fileinput();
        form_data.append('file', file_data);
        if (document.getElementById("input-folder-3").files.length == 0) {
            Swal.fire({
                title: '<span class="text-danger font-weight-bold">Error!!!</span>',
                html: '<span class="text-danger">Please upload a file</span>',
                showConfirmButton: false,
                width: 300,
                height: 200,
                imageUrl: '../../public/images/logo/logo.png',
                imageWidth: 100,
                imageHeight: 100,
                imageAlt: 'Custom image',
                timer: 3000
            });
        } else {
            Swal.fire({
                html: '<span class="text-danger font-weight-bold"> Are you sure you want to submit?</span>',
                showConfirmButton: true,
                showCancelButton: true,
                width: 500,
                height: 200,
                imageUrl: '../../public/images/logo/logo.png',
                imageWidth: 100,
                imageHeight: 100,
                imageAlt: 'Custom image',
                confirmButtonText: 'Yes!'
                //   timer: 3000
            }).then(function(result) {
                if (result.value) {
                    $.ajax({
                        url: "promo_returning",
                        method: "POST",
                        dataType: 'text',
                        cache: false,
                        contentType: false,
                        processData: false,
                        data: form_data,
                        success: function(data) {
                            console.log(data);
                            var response = JSON.parse(data);
                            console.log(response.status);
                            if (response.status == 'success') {
                                Swal.fire({
                                    title: 'Success!!!',
                                    html: '<span class="text-success">' +
                                        response.message + '</span>',
                                    showConfirmButton: false,
                                    width: 300,
                                    imageUrl: '../../public/images/logo/logo.png',
                                    imageWidth: 100,
                                    imageHeight: 100,
                                    imageAlt: 'Loading image',
                                    timer: 3000
                                }).then(function() {
                                    location.reload();
                                });
                            } else if (response.status == 'error') {
                                Swal.fire({
                                    title: 'Oooops!!!',
                                    html: '<span class="text-danger">' +
                                        response.message + '</span>',
                                    showConfirmButton: false,
                                    width: 300,
                                    imageUrl: '../../public/images/logo/logo.png',
                                    imageWidth: 100,
                                    imageHeight: 100,
                                    imageAlt: 'Loading image',
                                    timer: 3000
                                })
                            }

                        }
                    });
                }
            });
        }

    });
});


$(document).ready(function() {
    $('.updatedpffile_app').on('submit', function(event) {
        event.preventDefault();
        var form_data = new FormData(this);
        var file_data = $("#input-folder-5").fileinput();
        form_data.append('file', file_data);
        if (document.getElementById("input-folder-5").files.length == 0) {
            Swal.fire({
                title: '<span class="text-danger font-weight-bold">Error!!!</span>',
                html: '<span class="text-danger">Please upload a file</span>',
                showConfirmButton: false,
                width: 300,
                height: 200,
                imageUrl: '../../public/images/logo/logo.png',
                imageWidth: 100,
                imageHeight: 100,
                imageAlt: 'Custom image',
                timer: 3000
            });
        } else {
            Swal.fire({
                html: '<span class="text-danger font-weight-bold"> Are you sure you want to submit?</span>',
                showConfirmButton: true,
                showCancelButton: true,
                width: 500,
                height: 200,
                imageUrl: '../../public/images/logo/logo.png',
                imageWidth: 100,
                imageHeight: 100,
                imageAlt: 'Custom image',
                confirmButtonText: 'Yes!'
                //   timer: 3000
            }).then(function(result) {
                if (result.value) {
                    $.ajax({
                        url: "promo_returning",
                        method: "POST",
                        dataType: 'text',
                        cache: false,
                        contentType: false,
                        processData: false,
                        data: form_data,
                        success: function(data) {
                            console.log(data);
                            var response = JSON.parse(data);
                            console.log(response.status);
                            if (response.status == 'success') {
                                Swal.fire({
                                    title: 'Success!!!',
                                    html: '<span class="text-success">' +
                                        response.message + '</span>',
                                    showConfirmButton: false,
                                    width: 300,
                                    imageUrl: '../../public/images/logo/logo.png',
                                    imageWidth: 100,
                                    imageHeight: 100,
                                    imageAlt: 'Loading image',
                                    timer: 3000
                                }).then(function() {
                                    location.reload();
                                });
                            } else if (response.status == 'error') {
                                Swal.fire({
                                    title: 'Oooops!!!',
                                    html: '<span class="text-danger">' +
                                        response.message + '</span>',
                                    showConfirmButton: false,
                                    width: 300,
                                    imageUrl: '../../public/images/logo/logo.png',
                                    imageWidth: 100,
                                    imageHeight: 100,
                                    imageAlt: 'Loading image',
                                    timer: 3000
                                })
                            }

                        }
                    });
                }
            });
        }

    });
});

$(document).ready(function() {
    $('.updatedpffilepp').on('submit', function(event) {
        event.preventDefault();
        var form_data = new FormData(this);
        var file_data = $("#input-folder-1").fileinput();
        form_data.append('file', file_data);
        if (document.getElementById("input-folder-1").files.length == 0) {
            Swal.fire({
                title: '<span class="text-danger font-weight-bold">Error!!!</span>',
                html: '<span class="text-danger">Please upload a file</span>',
                showConfirmButton: false,
                width: 300,
                height: 200,
                imageUrl: '../../public/images/logo/logo.png',
                imageWidth: 100,
                imageHeight: 100,
                imageAlt: 'Custom image',
                timer: 3000
            });
        } else {
            Swal.fire({
                html: '<span class="text-danger font-weight-bold"> Are you sure you want to submit?</span>',
                showConfirmButton: true,
                showCancelButton: true,
                width: 500,
                height: 200,
                imageUrl: '../../public/images/logo/logo.png',
                imageWidth: 100,
                imageHeight: 100,
                imageAlt: 'Custom image',
                confirmButtonText: 'Yes!'
                //   timer: 3000
            }).then(function(result) {
                if (result.value) {
                    $.ajax({
                        url: "promo_returning",
                        method: "POST",
                        dataType: 'text',
                        cache: false,
                        contentType: false,
                        processData: false,
                        data: form_data,
                        success: function(data) {
                            console.log(data);
                            var response = JSON.parse(data);
                            console.log(response.status);
                            if (response.status == 'success') {
                                Swal.fire({
                                    title: 'Success!!!',
                                    html: '<span class="text-success">' +
                                        response.message + '</span>',
                                    showConfirmButton: false,
                                    width: 300,
                                    imageUrl: '../../public/images/logo/logo.png',
                                    imageWidth: 100,
                                    imageHeight: 100,
                                    imageAlt: 'Loading image',
                                    timer: 3000
                                }).then(function() {
                                    location.reload();
                                });
                            } else if (response.status == 'error') {
                                Swal.fire({
                                    title: 'Oooops!!!',
                                    html: '<span class="text-danger">' +
                                        response.message + '</span>',
                                    showConfirmButton: false,
                                    width: 300,
                                    imageUrl: '../../public/images/logo/logo.png',
                                    imageWidth: 100,
                                    imageHeight: 100,
                                    imageAlt: 'Loading image',
                                    timer: 3000
                                })
                            }

                        }
                    });
                }
            });
        }

    });
});

$(document).ready(function() {
    $('.updatedpffile2').on('submit', function(event) {
        event.preventDefault();
        var form_data = new FormData(this);
        var file_data = $("#input-folder-2").fileinput();
        var file_data = $("#input-folder-4").fileinput();
        var file_data = $("#input-folder-6").fileinput();
        form_data.append('file', file_data);
        if (document.getElementById("input-folder-2").files.length == 0 || document.getElementById(
            "input-folder-4").files.length == 0 || document.getElementById(
                "input-folder-6").files.length == 0) {
            Swal.fire({
                title: '<span class="text-danger font-weight-bold">Error!!!</span>',
                html: '<span class="text-danger">All files are required</span>',
                showConfirmButton: false,
                width: 300,
                height: 200,
                imageUrl: '../../public/images/logo/logo.png',
                imageWidth: 100,
                imageHeight: 100,
                imageAlt: 'Custom image',
                timer: 3000
            });
        } else {
            Swal.fire({
                html: '<span class="text-danger font-weight-bold"> Are you sure you want to submit?</span>',
                showConfirmButton: true,
                showCancelButton: true,
                width: 500,
                height: 200,
                imageUrl: '../../public/images/logo/logo.png',
                imageWidth: 100,
                imageHeight: 100,
                imageAlt: 'Custom image',
                confirmButtonText: 'Yes!'
                //   timer: 3000
            }).then(function(result) {
                if (result.value) {
                    $.ajax({
                        url: "promo_aprovalmienu",
                        method: "POST",
                        dataType: 'text',
                        cache: false,
                        contentType: false,
                        processData: false,
                        data: form_data,
                        success: function(data) {
                            console.log(data);
                            var response = JSON.parse(data);
                            console.log(response.status);
                            if (response.status == 'success') {
                                Swal.fire({
                                    title: 'Success!!!',
                                    html: '<span class="text-success">' +
                                        response.message + '</span>',
                                    showConfirmButton: false,
                                    width: 300,
                                    imageUrl: '../../public/images/logo/logo.png',
                                    imageWidth: 100,
                                    imageHeight: 100,
                                    imageAlt: 'Loading image',
                                    timer: 3000
                                }).then(function() {
                                    location.reload();
                                });
                            } else if (response.status == 'error') {
                                Swal.fire({
                                    title: 'Oooops!!!',
                                    html: '<span class="text-danger">' +
                                        response.message + '</span>',
                                    showConfirmButton: false,
                                    width: 300,
                                    imageUrl: '../../public/images/logo/logo.png',
                                    imageWidth: 100,
                                    imageHeight: 100,
                                    imageAlt: 'Loading image',
                                    timer: 3000
                                })
                            }

                        }
                    });
                }
            });
        }

    });
});

function showDiv1() {
    // Get the checkbox
    var checkBox = document.getElementById("save");
    // Get the output text
    //   var text = document.getElementById("text");

    // If the checkbox is checked, display the output text
    if (checkBox.checked == true) {
        //  alert('checked');
        // text.style.display = "block";
        var stval = document.getElementById('savecon').style.display = "block";
        var stval = document.getElementById('send').style.display = "none";
    } else {
        //  alert('checked1');    
        var stval = document.getElementById('send').style.display = "block";
        var stval = document.getElementById('savecon').style.display = "none";

    }
}

$(document).ready(function() {
    $('#tndapply').on('submit', function(event) {
        event.preventDefault();
        var form_data = new FormData(this);
        $.ajax({
            url: "send_tnd",
            method: "POST",
            dataType: 'text',
            cache: false,
            contentType: false,
            processData: false,
            data: form_data,
            success: function(data) {
                console.log(data);
                var response = JSON.parse(data);
                console.log(response.status);
                if (response.status == 'success') {
                    Swal.fire({
                        title: 'Success!!!',
                        html: '<span class="text-success">' + response.message +
                            '</span>',
                        showConfirmButton: false,
                        width: 300,
                        height: 200,
                        imageUrl: '../../public/images/logo/logo.png',
                        imageWidth: 100,
                        imageHeight: 100,
                        imageAlt: 'Custom image',
                        timer: 3000
                    }).then(function() {
                        // location.replace("https://comedigitalize.com");
                        location.reload();
                    });
                    $('#tndapply')[0].reset();
                    //   $('#sub_form').html(data);
                } else if (response.status == 'error') {
                    Swal.fire({
                        position: 'top-right',
                        title: '<span class="text-danger font-weight-bold">Error!!!</span>',
                        html: '<span class="text-danger">' + response.message +
                            '</span>',
                        showConfirmButton: false,
                        width: 300,
                        height: 200,
                        imageUrl: '../../public/images/logo/logo.png',
                        imageWidth: 100,
                        imageHeight: 100,
                        imageAlt: 'Custom image',
                        timer: 3000
                    });
                }

            }
        });

    });
});

$(document).ready(function() {
    $('#frmFileUpload').on('submit', function(event) {
        event.preventDefault();
        var form_data = new FormData(this);
        var file_data = $("#input-folder-3").fileinput();
        var file_data1 = $('.file-size-info');
        form_data.append('file', file_data);
        if ($('#position').val() == '') {
            Swal.fire({
                position: 'top-right',
                title: '<span class="text-danger font-weight-bold">Error!!!</span>',
                html: '<span class="text-danger">Please select position u are applying</span>',
                showConfirmButton: false,
                width: 300,
                height: 200,
                imageUrl: '../../public/images/logo/logo.png',
                imageWidth: 100,
                imageHeight: 100,
                imageAlt: 'Custom image',
                timer: 3000
            });
        } else {
            Swal.fire({
                //   position: 'top-right',
                html: '<span class="text-danger font-weight-bold"> Are you sure you want to apply?</span>',
                showConfirmButton: true,
                showCancelButton: true,
                width: 500,
                height: 200,
                imageUrl: '../../public/images/logo/logo.png',
                imageWidth: 100,
                imageHeight: 100,
                imageAlt: 'Custom image',
                confirmButtonText: 'Yes!'
                //   timer: 3000
            }).then(function(result) {
                if (result.value) {
                    $.ajax({
                        url: "send_promo",
                        method: "POST",
                        dataType: 'text',
                        cache: false,
                        contentType: false,
                        processData: false,
                        data: form_data,
                        success: function(data) {
                            console.log(data);
                            var response = JSON.parse(data);
                            console.log(response.status);
                            if (response.status == 'success') {
                                Swal.fire({
                                    title: 'Success!!!',
                                    html: '<span class="text-success">' +
                                        response.message + '</span>',
                                    showConfirmButton: false,
                                    width: 300,
                                    height: 200,
                                    imageUrl: '../../public/images/logo/logo.png',
                                    imageWidth: 100,
                                    imageHeight: 100,
                                    imageAlt: 'Custom image',
                                    timer: 3000
                                }).then(function() {
                                    // location.replace("https://comedigitalize.com");
                                    location.reload();
                                });
                                $('#frmFileUpload')[0].reset();
                                //   $('#sub_form').html(data);
                            } else if (response.status == 'error') {
                                Swal.fire({
                                    position: 'top-right',
                                    title: '<span class="text-danger font-weight-bold">Error!!!</span>',
                                    html: '<span class="text-danger">' +
                                        response.message + '</span>',
                                    showConfirmButton: false,
                                    width: 300,
                                    height: 200,
                                    imageUrl: '../../public/images/logo/logo.png',
                                    imageWidth: 100,
                                    imageHeight: 100,
                                    imageAlt: 'Custom image',
                                    timer: 3000
                                });
                            }

                        }
                    });
                }
            });
        }
    });
});


function checkint(evt) {
    var ch = String.fromCharCode(evt.which);

    if (!(/[0-9,.+/]/.test(ch))) {
        $(document).ready(function() {
            Swal.fire({
                position: 'top-left',
                type: 'error',
                title: 'ALPHABETS ARE NOT ALLOWED',
                showConfirmButton: false,
                timer: 2000

            })
        });
        evt.preventDefault()
    }
}


$(document).ready(function() {
    $('#proForm').on('submit', function(event) {
        event.preventDefault();
        var form_data = new FormData(this);
        // var file_data = $("#input-folder-3").fileinput();
        // var file_data1 = $('.file-size-info');
        // form_data.append('file', file_data);
        $.ajax({
            url: "send_procurement",
            method: "POST",
            dataType: 'text',
            cache: false,
            contentType: false,
            processData: false,
            data: form_data,
            success: function(data) {
                console.log(data);
                var response = JSON.parse(data);
                console.log(response.status);
                if (response.status == 'success') {
                    //   Swal.fire({
                    //   title: 'Success!!!',
                    //   html: '<span class="text-success">'+response.message+'</span>',
                    //   showConfirmButton: false,
                    //   width: 300,
                    //   height: 200,
                    //   imageUrl: '../../public/images/logo/logo.png',
                    //   imageWidth: 100,
                    //   imageHeight: 100,
                    //   imageAlt: 'Custom image',
                    //   timer: 3000
                    // }).then(function(){
                    // location.replace("https://comedigitalize.com");
                    location.reload();
                    // });
                    $('#proForm')[0].reset();
                    //   $('#sub_form').html(data);
                } else if (response.status == 'error') {
                    Swal.fire({
                        position: 'top-right',
                        title: '<span class="text-danger font-weight-bold">Error!!!</span>',
                        html: '<span class="text-danger">' + response.message +
                            '</span>',
                        showConfirmButton: false,
                        width: 300,
                        height: 200,
                        imageUrl: '../../public/images/logo/logo.png',
                        imageWidth: 100,
                        imageHeight: 100,
                        imageAlt: 'Custom image',
                        timer: 3000
                    });
                }

            }
        });

    });
});

function showDiv1() {
    // Get the checkbox
    var checkBox = document.getElementById("save");
    // Get the output text
    //   var text = document.getElementById("text");

    // If the checkbox is checked, display the output text
    if (checkBox.checked == true) {
        //  alert('checked');
        // text.style.display = "block";
        var stval = document.getElementById('savecon').style.display = "block";
        var stval = document.getElementById('send').style.display = "none";
    } else {
        //  alert('checked1');    
        var stval = document.getElementById('send').style.display = "block";
        var stval = document.getElementById('savecon').style.display = "none";

    }
}

$(document).ready(function() {
    $('#proDelForm').on('submit', function(event) {
        event.preventDefault();
        var form_data = new FormData(this);
        // var file_data = $("#input-folder-3").fileinput();
        // var file_data1 = $('.file-size-info');
        // form_data.append('file', file_data);
        $.ajax({
            url: "update_procurement",
            method: "POST",
            dataType: 'text',
            cache: false,
            contentType: false,
            processData: false,
            data: form_data,
            success: function(data) {
                console.log(data);
                var response = JSON.parse(data);
                console.log(response.status);
                if (response.status == 'success') {
                    Swal.fire({
                        title: 'Success!!!',
                        html: '<span class="text-success">' + response.message +
                            '</span>',
                        showConfirmButton: false,
                        width: 300,
                        height: 200,
                        imageUrl: '../../public/images/logo/logo.png',
                        imageWidth: 100,
                        imageHeight: 100,
                        imageAlt: 'Custom image',
                        timer: 3000
                    }).then(function() {
                        // location.replace("https://comedigitalize.com");
                        location.reload();
                    });
                    $('#proDelForm')[0].reset();
                    //   $('#sub_form').html(data);
                } else if (response.status == 'error') {
                    Swal.fire({
                        position: 'top-right',
                        title: '<span class="text-danger font-weight-bold">Error!!!</span>',
                        html: '<span class="text-danger">' + response.message +
                            '</span>',
                        showConfirmButton: false,
                        width: 300,
                        height: 200,
                        imageUrl: '../../public/images/logo/logo.png',
                        imageWidth: 100,
                        imageHeight: 100,
                        imageAlt: 'Custom image',
                        timer: 3000
                    });
                }

            }
        });

    });
});

<?php 
//if(!empty($appdata['app_status']) == 2){?>
<?php //}
//else{ ?>
$(document).ready(function() {
    $('#app_form_a').on('submit', function(event) {
        event.preventDefault();
        //   console.log('paw');
        if ($('#supervisor_name').val() == '') {
            Swal.fire({
                title: '<span class="text-danger font-weight-bold">Error!!!</span>',
                html: '<span class="text-danger">Please enter supervisors name</span>',
                showConfirmButton: false,
                width: 300,
                height: 200,
                imageUrl: '../../public/images/logo/logo.png',
                imageWidth: 100,
                imageHeight: 100,
                imageAlt: 'Custom image',
                timer: 3000
            });
        } else if (document.getElementById("emp_signed").checked == false) {
            Swal.fire({
                title: '<span class="text-danger font-weight-bold">Error!!!</span>',
                html: '<span class="text-danger">Employee signature should be check</span>',
                showConfirmButton: false,
                width: 300,
                height: 200,
                imageUrl: '../../public/images/logo/logo.png',
                imageWidth: 100,
                imageHeight: 100,
                imageAlt: 'Custom image',
                timer: 3000
            });
        } else {
            Swal.fire({
                html: '<span class="text-danger font-weight-bold"> Are you sure you want to submit?</span>',
                showConfirmButton: true,
                showCancelButton: true,
                width: 500,
                height: 200,
                imageUrl: '../../public/images/logo/logo.png',
                imageWidth: 100,
                imageHeight: 100,
                imageAlt: 'Custom image',
                confirmButtonText: 'Yes!'
            }).then(function(result) {
                if (result.value) {
                    $.ajax({
                        url: "staff_self_appraisal",
                        method: "POST",
                        data: $('#app_form_a').serialize(),
                        success: function(data) {
                            console.log(data);
                            var response = JSON.parse(data);
                            console.log(response.status);
                            if (response.status == 'success') {
                                Swal.fire({
                                    title: 'Success!!!',
                                    html: '<span class="text-success">' +
                                        response.message + '</span>',
                                    showConfirmButton: false,
                                    width: 300,
                                    imageUrl: '../../public/images/logo/logo.png',
                                    imageWidth: 100,
                                    imageHeight: 100,
                                    imageAlt: 'Loading image',
                                    timer: 3000
                                }).then(function() {
                                    // location.replace("http://staffportal.com/appraisal_a");
                                    location.reload();
                                });
                            } else if (response.status == 'error') {
                                Swal.fire({
                                    title: 'Oooops!!!',
                                    html: '<span class="text-danger">' +
                                        response.message + '</span>',
                                    showConfirmButton: false,
                                    width: 300,
                                    imageUrl: '../../public/images/logo/logo.png',
                                    imageWidth: 100,
                                    imageHeight: 100,
                                    imageAlt: 'Loading image',
                                    timer: 3000
                                })
                            }

                        }
                    });
                }
            });
        }
    });
});
<?php //}
?>

<?php //if(!empty($appdata['app_status']) == 2){?>

<?php //} else{ ?>

$(document).ready(function() {
    $('#app_form1').on('submit', function(event) {
        event.preventDefault();
        if ($('supervisor_name1').val() == '') {
            Swal.fire({
                title: '<span class="text-danger font-weight-bold">Error!!!</span>',
                html: '<span class="text-danger">Please enter supervisors name</span>',
                showConfirmButton: false,
                width: 300,
                height: 200,
                imageUrl: '../../public/images/logo/logo.png',
                imageWidth: 100,
                imageHeight: 100,
                imageAlt: 'Custom image',
                timer: 3000
            });
        } else if (document.getElementById("sup_signed1").checked == false) {
            Swal.fire({
                title: '<span class="text-danger font-weight-bold">Error!!!</span>',
                html: '<span class="text-danger">Supervisor Signature cannot be uncheck</span>',
                showConfirmButton: false,
                width: 300,
                height: 200,
                imageUrl: '../../public/images/logo/logo.png',
                imageWidth: 100,
                imageHeight: 100,
                imageAlt: 'Custom image',
                timer: 3000
            });
        } else {
            if (document.getElementById("sup_signed1").checked == true) {
                Swal.fire({
                    html: '<span class="text-danger font-weight-bold"> Are you sure you want to submit?</span>',
                    showConfirmButton: true,
                    showCancelButton: true,
                    width: 500,
                    height: 200,
                    imageUrl: '../../public/images/logo/logo.png',
                    imageWidth: 100,
                    imageHeight: 100,
                    imageAlt: 'Custom image',
                    confirmButtonText: 'Yes!'
                }).then(function(result) {
                    if (result.value) {
                        $.ajax({
                            url: "../staff_appraisal",
                            method: "POST",
                            data: $('#app_form1').serialize(),
                            success: function(data) {
                                console.log(data);
                                var response = JSON.parse(data);
                                console.log(response.status);
                                if (response.status == 'success') {
                                    Swal.fire({
                                        title: 'Success!!!',
                                        html: '<span class="text-success">' +
                                            response.message + '</span>',
                                        showConfirmButton: false,
                                        width: 300,
                                        imageUrl: '../../public/images/logo/logo.png',
                                        imageWidth: 100,
                                        imageHeight: 100,
                                        imageAlt: 'Loading image',
                                        timer: 3000
                                    }).then(function() {
                                        location.reload();
                                    });
                                } else if (response.status == 'error') {
                                    Swal.fire({
                                        title: 'Oooops!!!',
                                        html: '<span class="text-danger">' +
                                            response.message + '</span>',
                                        showConfirmButton: false,
                                        width: 300,
                                        imageUrl: '../../public/images/logo/logo.png',
                                        imageWidth: 100,
                                        imageHeight: 100,
                                        imageAlt: 'Loading image',
                                        timer: 3000
                                    })
                                }

                            }
                        });
                    }
                });
            }
        }
    });
});


$(document).ready(function() {
    $('#app_form').on('submit', function(event) {
        event.preventDefault();
        if (document.getElementById("sup_signed").checked == false) {
            Swal.fire({
                title: '<span class="text-danger font-weight-bold">Error!!!</span>',
                html: '<span class="text-danger">Supervisor Signed cannot be uncheck</span>',
                showConfirmButton: false,
                width: 300,
                height: 200,
                imageUrl: '../../public/images/logo/logo.png',
                imageWidth: 100,
                imageHeight: 100,
                imageAlt: 'Custom image',
                timer: 3000
            });
        } else {
            if (document.getElementById("sup_signed").checked == true) {
                Swal.fire({
                    html: '<span class="text-danger font-weight-bold"> Are you sure you want to submit?</span>',
                    showConfirmButton: true,
                    showCancelButton: true,
                    width: 500,
                    height: 200,
                    imageUrl: '../../public/images/logo/logo.png',
                    imageWidth: 100,
                    imageHeight: 100,
                    imageAlt: 'Custom image',
                    confirmButtonText: 'Yes!'
                }).then(function(result) {
                    if (result.value) {
                        $.ajax({
                            url: "../staff_self_appraisal_update",
                            method: "POST",
                            data: $('#app_form').serialize(),
                            success: function(data) {
                                console.log(data);
                                var response = JSON.parse(data);
                                console.log(response.status);
                                if (response.status == 'success') {
                                    Swal.fire({
                                        title: 'Success!!!',
                                        html: '<span class="text-success">' +
                                            response.message + '</span>',
                                        showConfirmButton: false,
                                        width: 300,
                                        imageUrl: '../../public/images/logo/logo.png',
                                        imageWidth: 100,
                                        imageHeight: 100,
                                        imageAlt: 'Loading image',
                                        timer: 3000
                                    }).then(function() {
                                        location.reload();
                                    });
                                } else if (response.status == 'error') {
                                    Swal.fire({
                                        title: 'Oooops!!!',
                                        html: '<span class="text-danger">' +
                                            response.message + '</span>',
                                        showConfirmButton: false,
                                        width: 300,
                                        imageUrl: '../../public/images/logo/logo.png',
                                        imageWidth: 100,
                                        imageHeight: 100,
                                        imageAlt: 'Loading image',
                                        timer: 3000
                                    })
                                }

                            }
                        });
                    }
                });
            }

        }
    });
});
<?php 
// }
?>

$(document).ready(function() {
    $('[data-toggle="tooltip"]').tooltip();
});




function staff_doc(id) {
    var data = id;
    jQuery.ajax({
        url: "/ajax/modal_function",
        method: "post",
        data: "promo_id=" + data,
        success: function(data) {
            jQuery('body').append(data);
            jQuery('#documents').modal('toggle');
        },
        // success:function(html){
        //     $('#notice').html(html);
        // },
        error: function() {
            alert("Something went wrong");
        }
    });
}



function closeModal() {
    jQuery('#assign_assessor').modal('hide');
    setTimeout(function() {
        jQuery('#assign_assessor').remove();
        jQuery('.modal_backdrop').remove();
    }, 300);
}


function closeModal1() {
    jQuery('.status_modal').modal('hide');
    setTimeout(function() {
        jQuery('.status_modal').remove();
        jQuery('.modal_backdrop').remove();
    }, 300);
}


function assessor(id) {
    var data = id;
    console.log(data);
    jQuery.ajax({
        url: "assessor",
        method: "post",
        data: "promo_assess=" + data,
        success: function(data) {
            jQuery('body').append(data);
            jQuery('#assign_assessor').modal('toggle');

        },
        error: function() {
            alert("Something went wrong");
        }
    });
}

function assessor(id) {
    var data = id;
    console.log(data);
    jQuery.ajax({
        url: "assessor",
        method: "post",
        data: "promo_assess=" + data,
        success: function(data) {
            jQuery('body').append(data);
            jQuery('#assign_assessor').modal('toggle');

        },
        error: function() {
            alert("Something went wrong");
        }
    });
}

function es_modal(id) {
    var data = id;
    console.log(data);
    jQuery.ajax({
        url: "/modal/es_modal",
        method: "post",
        data: "dept_id=" + data,
        success: function(data) {
            jQuery('body').append(data);
            jQuery('#deptdata').modal('toggle');

        },
        error: function() {
            alert("Something went wrong");
        }
    });
}

function action_modalhr(id) {
    var data = id;
    console.log(data);
    jQuery.ajax({
        url: "/modal/approve_modalhr",
        method: "post",
        data: "promo_id=" + data + ',' + '4',
        success: function(data) {
            jQuery('body').append(data);
            jQuery('#approval_modal').modal('toggle');

        },
        error: function() {
            alert("Something went wrong");
        }
    });
}

$(document).ready(function() {
    $('.assessor_ass').on('submit', function(event) {
        event.preventDefault();
        if ($('#assessor1').val() == '') {
            Swal.fire({
                title: '<span class="text-danger font-weight-bold">Error!!!</span>',
                html: '<span class="text-danger">Please enter assessors first name</span>',
                showConfirmButton: false,
                width: 300,
                height: 200,
                imageUrl: '../../public/images/logo/logo.png',
                imageWidth: 100,
                imageHeight: 100,
                imageAlt: 'Custom image',
                timer: 3000
            });
        } else {
            Swal.fire({
                html: '<span class="text-danger font-weight-bold"> Are you sure you want to add Assessor(s)?</span>',
                showConfirmButton: true,
                showCancelButton: true,
                width: 500,
                height: 200,
                imageUrl: '../../public/images/logo/logo.png',
                imageWidth: 100,
                imageHeight: 100,
                imageAlt: 'Custom image',
                confirmButtonText: 'Yes!'
                //   timer: 3000
            }).then(function(result) {
                if (result.value) {
                    $.ajax({
                        url: "addassessor",
                        method: "POST",
                        data: $('#assessor_ass').serialize(),
                        success: function(data) {
                            console.log(data);
                            var response = JSON.parse(data);
                            console.log(response.status);
                            if (response.status == 'success') {
                                Swal.fire({
                                    title: 'Success!!!',
                                    html: '<span class="text-success">' +
                                        response.message + '</span>',
                                    showConfirmButton: false,
                                    width: 300,
                                    height: 200,
                                    imageUrl: '../../public/images/logo/logo.png',
                                    imageWidth: 100,
                                    imageHeight: 100,
                                    imageAlt: 'Custom image',
                                    timer: 3000
                                }).then(function() {
                                    location.reload();
                                });
                            } else if (response.status == 'error') {
                                Swal.fire({
                                    title: '<span class="text-danger font-weight-bold">Error!!!</span>',
                                    html: '<span class="text-danger">' +
                                        response.message + '</span>',
                                    showConfirmButton: false,
                                    width: 300,
                                    height: 200,
                                    imageUrl: '../../public/images/logo/logo.png',
                                    imageWidth: 100,
                                    imageHeight: 100,
                                    imageAlt: 'Custom image',
                                    timer: 3000
                                });
                            }

                        }
                    });
                }
            });
        }

    });
});

$(document).ready(function() {
    $('.addaccessor').on('submit', function(event) {
        event.preventDefault();
        if ($('#fname').val() == '') {
            Swal.fire({
                title: '<span class="text-danger font-weight-bold">Error!!!</span>',
                html: '<span class="text-danger">Please enter assessors first name</span>',
                showConfirmButton: false,
                width: 300,
                height: 200,
                imageUrl: '../../public/images/logo/logo.png',
                imageWidth: 100,
                imageHeight: 100,
                imageAlt: 'Custom image',
                timer: 3000
            });
        } else if ($('#lname').val() == '') {
            Swal.fire({
                title: '<span class="text-danger font-weight-bold">Error!!!</span>',
                html: '<span class="text-danger">Please enter assessors last name</span>',
                showConfirmButton: false,
                width: 300,
                height: 200,
                imageUrl: '../../public/images/logo/logo.png',
                imageWidth: 100,
                imageHeight: 100,
                imageAlt: 'Custom image',
                timer: 3000
            });
        } else if ($('#area_special').val() == '') {
            Swal.fire({
                title: '<span class="text-danger font-weight-bold">Error!!!</span>',
                html: '<span class="text-danger">Please select area of speciality</span>',
                showConfirmButton: false,
                width: 300,
                height: 200,
                imageUrl: '../../public/images/logo/logo.png',
                imageWidth: 100,
                imageHeight: 100,
                imageAlt: 'Custom image',
                timer: 3000
            });
        } else {
            Swal.fire({
                html: '<span class="text-danger font-weight-bold"> Are you sure you want to add this Assessor?</span>',
                showConfirmButton: true,
                showCancelButton: true,
                width: 500,
                height: 200,
                imageUrl: '../../public/images/logo/logo.png',
                imageWidth: 100,
                imageHeight: 100,
                imageAlt: 'Custom image',
                confirmButtonText: 'Yes!'
                //   timer: 3000
            }).then(function(result) {
                if (result.value) {
                    $.ajax({
                        url: "addassessor",
                        method: "POST",
                        //   data:form_data,
                        data: $('#addaccessor').serialize(),
                        success: function(data) {
                            console.log(data);
                            var response = JSON.parse(data);
                            console.log(response.status);
                            if (response.status == 'success') {
                                Swal.fire({
                                    title: 'Success!!!',
                                    html: '<span class="text-success">' +
                                        response.message + '</span>',
                                    showConfirmButton: false,
                                    width: 300,
                                    height: 200,
                                    imageUrl: '../../public/images/logo/logo.png',
                                    imageWidth: 100,
                                    imageHeight: 100,
                                    imageAlt: 'Custom image',
                                    timer: 3000
                                }).then(function() {
                                    location.reload();
                                });
                            } else if (response.status == 'error') {
                                Swal.fire({
                                    title: '<span class="text-danger font-weight-bold">Error!!!</span>',
                                    html: '<span class="text-danger">' +
                                        response.message + '</span>',
                                    showConfirmButton: false,
                                    width: 300,
                                    height: 200,
                                    imageUrl: '../../public/images/logo/logo.png',
                                    imageWidth: 100,
                                    imageHeight: 100,
                                    imageAlt: 'Custom image',
                                    timer: 3000
                                });
                            }

                        }
                    });
                }
            });
        }

    });
});


function approve_promodean(id) {
    event.preventDefault();
    var data = id;
    Swal.fire({
        title: 'Approve Promotion',
        html: '<span class="text-danger">Are you sure you want to disapprove this promotion?' + data +
            '</span> <br><br> Leave a Comment',
        imageUrl: '../../public/images/logo/logo.png',
        imageWidth: 100,
        imageHeight: 100,
        type: "input",
        input: 'text',
        confirmButtonText: 'Yes! Approve',
        showCancelButton: true,
        confirmButtonColor: '#F96332',
        showConfirmButton: true
    }).then(function(result) {
        if (result.value) {
            $.ajax({
                url: "/users/promo_action",
                method: "POST",
                data: "promo_id=" + data + ',' + '3' + ',' + '1' + ',' + 'Approved' + ',' + result
                    .value,
                success: function(result) {
                    console.log(result)
                    var response = JSON.parse(result);
                    console.log(response.status);
                    if (response.status == 'success') {
                        Swal.fire({
                            title: 'Success!!!',
                            html: '<span class="text-success">' + response.message +
                                '</span>',
                            showConfirmButton: false,
                            width: 300,
                            imageUrl: '../../public/images/logo/logo.png',
                            imageWidth: 100,
                            imageHeight: 100,
                            imageAlt: 'Loading image',
                            timer: 3000
                        }).then(function() {
                            location.reload();
                            // location.replace("http://localhost:8080/admissionverify");
                        });

                        // $('#approve_form')[0].reset();
                    } else if (response.status == 'error') {
                        Swal.fire({
                            title: 'Oooops!!!',
                            html: '<span class="text-danger">' + response.message +
                                '</span>',
                            showConfirmButton: false,
                            width: 300,
                            imageUrl: '../../public/images/logo/logo.png',
                            imageWidth: 100,
                            imageHeight: 100,
                            imageAlt: 'Loading image',
                            timer: 3000
                        })
                    }
                }
            });
        }
    });
}

function disapprove_promodean(id) {
    event.preventDefault();
    var data = id;
    Swal.fire({
        title: 'Approve Promotion',
        html: '<span class="text-danger">Are you sure you want to disapprove this promotion?' + data +
            '</span> <br><br> Leave a Comment',
        imageUrl: '../../public/images/logo/logo.png',
        imageWidth: 100,
        imageHeight: 100,
        type: "input",
        input: 'text',
        confirmButtonText: 'Yes! Dispprove',
        showCancelButton: true,
        confirmButtonColor: '#F96332',
        showConfirmButton: true
    }).then(function(result) {
        if (result.value) {
            $.ajax({
                url: "/users/promo_action",
                method: "POST",
                data: "promo_id=" + data + ',' + '2' + ',' + '2' + ',' + 'Disapproved' + ',' + result
                    .value,
                success: function(result) {
                    console.log(result)
                    var response = JSON.parse(result);
                    console.log(response.status);
                    if (response.status == 'success') {
                        Swal.fire({
                            title: 'Success!!!',
                            html: '<span class="text-success">' + response.message +
                                '</span>',
                            showConfirmButton: false,
                            width: 300,
                            imageUrl: '../../public/images/logo/logo.png',
                            imageWidth: 100,
                            imageHeight: 100,
                            imageAlt: 'Loading image',
                            timer: 3000
                        }).then(function() {
                            location.reload();
                            // location.replace("http://localhost:8080/admissionverify");
                        });

                        // $('#approve_form')[0].reset();
                    } else if (response.status == 'error') {
                        Swal.fire({
                            title: 'Oooops!!!',
                            html: '<span class="text-danger">' + response.message +
                                '</span>',
                            showConfirmButton: false,
                            width: 300,
                            imageUrl: '../../public/images/logo/logo.png',
                            imageWidth: 100,
                            imageHeight: 100,
                            imageAlt: 'Loading image',
                            timer: 3000
                        })
                    }
                }
            });
        }
    });
}




function approve_promohod(id) {
    event.preventDefault();
    var data = id;
    Swal.fire({
        title: 'Approve Promotion',
        html: '<span class="text-danger">Are you sure you want to disapprove this promotion?' + data +
            '</span> <br><br> Leave a Comment',
        imageUrl: '../../public/images/logo/logo.png',
        imageWidth: 100,
        imageHeight: 100,
        type: "input",
        input: 'text',
        confirmButtonText: 'Yes! Approve',
        showCancelButton: true,
        confirmButtonColor: '#F96332',
        showConfirmButton: true
    }).then(function(result) {
        if (result.value) {
            $.ajax({
                url: "/users/promo_action",
                method: "POST",
                data: "promo_id=" + data + ',' + '2' + ',' + '1' + ',' + 'Approved' + ',' + result
                    .value,
                success: function(result) {
                    console.log(result)
                    var response = JSON.parse(result);
                    console.log(response.status);
                    if (response.status == 'success') {
                        Swal.fire({
                            title: 'Success!!!',
                            html: '<span class="text-success">' + response.message +
                                '</span>',
                            showConfirmButton: false,
                            width: 300,
                            imageUrl: '../../public/images/logo/logo.png',
                            imageWidth: 100,
                            imageHeight: 100,
                            imageAlt: 'Loading image',
                            timer: 3000
                        }).then(function() {
                            location.reload();
                            // location.replace("http://localhost:8080/admissionverify");
                        });

                        // $('#approve_form')[0].reset();
                    } else if (response.status == 'error') {
                        Swal.fire({
                            title: 'Oooops!!!',
                            html: '<span class="text-danger">' + response.message +
                                '</span>',
                            showConfirmButton: false,
                            width: 300,
                            imageUrl: '../../public/images/logo/logo.png',
                            imageWidth: 100,
                            imageHeight: 100,
                            imageAlt: 'Loading image',
                            timer: 3000
                        })
                    }
                }
            });
        }
    });
}

function disapprove_promohod(id) {
    event.preventDefault();
    var data = id;
    Swal.fire({
        title: 'Approve Promotion',
        html: '<span class="text-danger">Are you sure you want to disapprove this promotion?' + data +
            '</span> <br><br> Leave a Comment',
        imageUrl: '../../public/images/logo/logo.png',
        imageWidth: 100,
        imageHeight: 100,
        type: "input",
        input: 'text',
        confirmButtonText: 'Yes! Dispprove',
        showCancelButton: true,
        confirmButtonColor: '#F96332',
        showConfirmButton: true
    }).then(function(result) {
        if (result.value) {
            $.ajax({
                url: "/users/promo_action",
                method: "POST",
                data: "promo_id=" + data + ',' + '1' + ',' + '2' + ',' + 'Disapproved' + ',' + result
                    .value,
                success: function(result) {
                    console.log(result)
                    var response = JSON.parse(result);
                    console.log(response.status);
                    if (response.status == 'success') {
                        Swal.fire({
                            title: 'Success!!!',
                            html: '<span class="text-success">' + response.message +
                                '</span>',
                            showConfirmButton: false,
                            width: 300,
                            imageUrl: '../../public/images/logo/logo.png',
                            imageWidth: 100,
                            imageHeight: 100,
                            imageAlt: 'Loading image',
                            timer: 3000
                        }).then(function() {
                            location.reload();
                            // location.replace("http://localhost:8080/admissionverify");
                        });

                        // $('#approve_form')[0].reset();
                    } else if (response.status == 'error') {
                        Swal.fire({
                            title: 'Oooops!!!',
                            html: '<span class="text-danger">' + response.message +
                                '</span>',
                            showConfirmButton: false,
                            width: 300,
                            imageUrl: '../../public/images/logo/logo.png',
                            imageWidth: 100,
                            imageHeight: 100,
                            imageAlt: 'Loading image',
                            timer: 3000
                        })
                    }
                }
            });
        }
    });
}




function approve_promoprovost(id) {
    event.preventDefault();
    var data = id;
    Swal.fire({
        title: 'Approve Promotion',
        html: '<span class="text-danger">Are you sure you want to disapprove this promotion?' + data +
            '</span> <br><br> Leave a Comment',
        imageUrl: '../../public/images/logo/logo.png',
        imageWidth: 100,
        imageHeight: 100,
        type: "input",
        input: 'text',
        confirmButtonText: 'Yes! Approve',
        showCancelButton: true,
        confirmButtonColor: '#F96332',
        showConfirmButton: true
    }).then(function(result) {
        if (result.value) {
            $.ajax({
                url: "/users/promo_action",
                method: "POST",
                data: "promo_id=" + data + ',' + '4' + ',' + '1' + ',' + 'Approved' + ',' + result
                    .value,
                success: function(result) {
                    console.log(result)
                    var response = JSON.parse(result);
                    console.log(response.status);
                    if (response.status == 'success') {
                        Swal.fire({
                            title: 'Success!!!',
                            html: '<span class="text-success">' + response.message +
                                '</span>',
                            showConfirmButton: false,
                            width: 300,
                            imageUrl: '../../public/images/logo/logo.png',
                            imageWidth: 100,
                            imageHeight: 100,
                            imageAlt: 'Loading image',
                            timer: 3000
                        }).then(function() {
                            location.reload();
                            // location.replace("http://localhost:8080/admissionverify");
                        });

                        // $('#approve_form')[0].reset();
                    } else if (response.status == 'error') {
                        Swal.fire({
                            title: 'Oooops!!!',
                            html: '<span class="text-danger">' + response.message +
                                '</span>',
                            showConfirmButton: false,
                            width: 300,
                            imageUrl: '../../public/images/logo/logo.png',
                            imageWidth: 100,
                            imageHeight: 100,
                            imageAlt: 'Loading image',
                            timer: 3000
                        })
                    }
                }
            });
        }
    });
}

function disapprove_promoprovost(id) {
    event.preventDefault();
    var data = id;
    Swal.fire({
        title: 'Approve Promotion',
        html: '<span class="text-danger">Are you sure you want to disapprove this promotion?' + data +
            '</span> <br><br> Leave a Comment',
        imageUrl: '../../public/images/logo/logo.png',
        imageWidth: 100,
        imageHeight: 100,
        type: "input",
        input: 'text',
        confirmButtonText: 'Yes! Dispprove',
        showCancelButton: true,
        confirmButtonColor: '#F96332',
        showConfirmButton: true
    }).then(function(result) {
        if (result.value) {
            $.ajax({
                url: "/users/promo_action",
                method: "POST",
                data: "promo_id=" + data + ',' + '3' + ',' + '2' + ',' + 'Disapproved' + ',' + result
                    .value,
                success: function(result) {
                    console.log(result)
                    var response = JSON.parse(result);
                    console.log(response.status);
                    if (response.status == 'success') {
                        Swal.fire({
                            title: 'Success!!!',
                            html: '<span class="text-success">' + response.message +
                                '</span>',
                            showConfirmButton: false,
                            width: 300,
                            imageUrl: '../../public/images/logo/logo.png',
                            imageWidth: 100,
                            imageHeight: 100,
                            imageAlt: 'Loading image',
                            timer: 3000
                        }).then(function() {
                            location.reload();
                            // location.replace("http://localhost:8080/admissionverify");
                        });

                        // $('#approve_form')[0].reset();
                    } else if (response.status == 'error') {
                        Swal.fire({
                            title: 'Oooops!!!',
                            html: '<span class="text-danger">' + response.message +
                                '</span>',
                            showConfirmButton: false,
                            width: 300,
                            imageUrl: '../../public/images/logo/logo.png',
                            imageWidth: 100,
                            imageHeight: 100,
                            imageAlt: 'Loading image',
                            timer: 3000
                        })
                    }
                }
            });
        }
    });
}
  </script>
  </body>

  </html>