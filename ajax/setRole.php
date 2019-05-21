<?php
    if(isset($_POST['setRole'])) {
        $_SESSION['role'] = $_POST['setRole'];
    } else if(isset($_GET['setRole'])){
        $_SESSION['role'] = $_GET['setRole'];
    }
?>