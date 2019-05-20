<!-- starting Page to configure Game and Clients -->
<h1>Configuration Page</h1>
<form method="post" action="index.php">
    <select name="setRole">
        <?php
        for($i = 1; $i <= $number_groups; $i++){
            echo "<option value='$i'>".$config["group_names"]["gr".$i]."</option>"; //add one select option for each configured group and get group name from config
        }
        ?>
    </select><br>
    <p>
        <input type="checkbox" required id="checkRoleSub"><label for="checkRoleSub">Rolle auswählen</label><br>
        <input type="submit">
    </p>
</form>
<?php

?>