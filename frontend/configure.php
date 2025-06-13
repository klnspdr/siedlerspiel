<!-- starting Page to configure Game and Clients -->
<p class="titleOwn">Configuration Page</p>
<form method="post" action="index.php">
    <select name="setRole">
        <?php
        for($i = 1; $i <= $number_groups; $i++){
            echo "<option value='$i'>".$config["group_names"]["gr".$i]."</option>"; //add one select option for each configured group and get group name from config
        }
        ?>
        <option value="100">OVERVIEW (Beamer)</option>
    </select><br>
    <p>
        <input type="checkbox" required id="checkRoleSub"><label for="checkRoleSub">Rolle bestätigen</label><br>
        <input type="submit" value="Auswahl abschicken">
    </p>
</form>
<div class="infoFrame" id="gameControl">
    <h4>Game Control</h4>
    <p>
        <a href="config-helper.html">Config Helper</a>
    </p>
    <p>
        <a href="ajax/clearDB.php">Clear Database</a>
        <br>
        <a href="ajax/initDB.php">Initialize Database</a>
    </p>
    <p>
        <a href="ajax/toggleDisplayScore.php">Toggle Display Score</a>
    </p>
    <p>
        <a href="/phpMyAdmin5">phpMyAdmin (for MAMP users)</a>
    </p>
</div>
<div class="infoFrame" id="netInfo">
    Server WiFi IP:
    <ul>
<?php
$interfaces = net_get_interfaces();
if(isset($interfaces['en0']['unicast'])) {
    foreach ($interfaces['en0']['unicast'] as $ip) {
        if (isset($ip['address'])) {
            echo "<li>";
            echo $ip['address'];
            echo "</li>";
        }
    }
}
else{
    echo "Feature only usable on MacBooks and maybe Linux";
}


?>
    </ul>
</div>