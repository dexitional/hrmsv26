<section class="section">
    <div class="row">
        <div class="col s12">
            <h5 class="blue-text text-darken-3 mt-4">
                Apply for Contract Renewal / Confirmation
            </h5>
            <div class="divider"></div>
        </div>
    </div>

    <div class="row">
        <div class="col s12">
            <div class="card">
                <div class="card-content">
                    <span class="card-title">
                        <strong>CONTRACT</strong> RENEWAL / CONFIRMATION
                    </span>

                    <form id="frmFileUpload_contract" method="post" enctype="multipart/form-data">
                        <input type="hidden" name="apply_type" id="apply_type" value="1">

                        <!-- Job Rank -->
                        <div class="row ">
                            <div class="input-field col s12">
                                <label class="active">Job Rank</label>
                                <select name="position" id="position" class="select2 browser-default">
                                    <option value="">Select rank you are applying for</option>
                                    <?php foreach ($data as $position): ?>
                                        <option value="<?= $position['id']; ?>">
                                            <?= $position['title']; ?>
                                        </option>
                                    <?php endforeach; ?>
                                </select>
                            </div>
                        </div>

                        <!-- Uploads -->
                        <div class="row">
                            <div class="col s12 m6">
                                <label class="font-weight-600">
                                    Upload Supporting Documents
                                </label>
                                <p class="red-text text-darken-1">
                                    PDF / JPG / JPEG only
                                </p>
                                <div class="file-loading">
                                    <input
                                        id="supporting-documents"
                                        name="input-folder-3"
                                        type="file"
                                        class="uploadsupporting"
                                        accept=".pdf,.jpg,.jpeg,.png"
                                    >
                                </div>
                                <div id="support-preview" class="mt-2"></div>
                            </div>

                            <div class="col s12 m6">
                                <label class="font-weight-600">
                                    Upload Curriculum Vitae (CV)
                                </label>
                                <p class="red-text text-darken-1">
                                    PDF / JPG / JPEG only
                                </p>
                                <div class="file-loading">
                                    <input
                                        id="cv-upload"
                                        name="input-folder-4"
                                        type="file"
                                        class="uploadcv"
                                        accept=".pdf,.jpg,.jpeg,.png"
                                    >
                                </div>
                                <div id="cv-preview" class="mt-2"></div>
                            </div>
                        </div>

                        <!-- Submit -->
                        <div class="row mt-4">
                            <div class="col s12 center-align">
                                <button
                                    type="submit"
                                    name="submit"
                                    class="btn waves-effect waves-light gradient-45deg-indigo-blue"
                                    style="width: 100%;"
                                >
                                    Submit Application
                                    <i class="material-icons right">send</i>
                                </button>
                            </div>
                        </div>
                    </form>

                </div>
            </div>
        </div>
    </div>
</section>

<script>
document.getElementById("supporting-documents").addEventListener("change", function(e) {
    previewFile(e.target.files[0], "support-preview");
});

document.getElementById("cv-upload").addEventListener("change", function(e) {
    previewFile(e.target.files[0], "cv-preview");
});

function previewFile(file, previewId) {
    let previewContainer = document.getElementById(previewId);
    previewContainer.innerHTML = "";

    if (!file) return;

    let fileType = file.type;
    let fileURL = URL.createObjectURL(file);

    // If Image
    if (fileType.startsWith("image/")) {
        previewContainer.innerHTML = `
            <img src="${fileURL}" style="max-width:100%; height:auto; border-radius:8px;">
        `;
    }

    // If PDF
    else if (fileType === "application/pdf") {
        previewContainer.innerHTML = `
            <iframe src="${fileURL}" width="100%" height="400px" style="border:none;"></iframe>
        `;
    }

    // Other Files
    else {
        previewContainer.innerHTML = `
            <p class="green-text">
                File selected: ${file.name}
            </p>
        `;
    }
}
</script>
