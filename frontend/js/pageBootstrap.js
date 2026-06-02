/* global config, groupId */

function hasConfig() {
  return typeof config !== "undefined" && config;
}

function renderRoleOptions() {
  const select = document.getElementById("roleSelect");
  
  if (!select || !hasConfig()) {
    return;
  }

  const options = [];
  for (let i = 1; i <= config.number_groups; i++) {
    options.push(
      `<option value="${i}">${config.group_names[`gr${i}`]}</option>`,
    );
  }
  options.push('<option value="100">OVERVIEW (Beamer)</option>');
  select.innerHTML = options.join("");
}

function renderBuyButtons() {
  const tableBody = document.getElementById("buyButtonTableBody");
  if (!tableBody || !hasConfig()) {
    return;
  }

  let html = "";
  const numberRows = Math.ceil(config.number_items / 5);
  for (let row = 0; row < numberRows; row++) {
    html += "<tr>";
    for (let col = 1; col <= 5; col++) {
      const buttonNum = row * 5 + col;
      if (buttonNum <= config.number_items) {
        const buttonName = config[`item${buttonNum}`].name;
        html += `<td><button class='button buyItem' onclick='buyItemButton(${buttonNum}, "${buttonName}", groupId)' id='item${buttonNum}' href='#'><span>${buttonName}</span><img class='buttonIcon' alt='' src='${config.icon_file_dir}${config[`item${buttonNum}`].icon_file_name}'></button></td>`;
      } else {
        html += "<td></td>";
      }
    }
    html += "</tr>";
  }

  tableBody.innerHTML = html;
}

function renderActionButtons() {
  const tableBody = document.getElementById("actButtonTableBody");
  if (!tableBody || !hasConfig()) {
    return;
  }

  let html = "";
  for (let row = 1; row <= config.number_actions; row++) {
    html += `<tr><td><button class='button' onclick='runActionButton(${row}, "${config[`action${row}`].name}", groupId)' id='actAction${row}' href='#'>${config[`action${row}`].name}</button></td></tr>`;
  }

  tableBody.innerHTML = html;
}

function applyRoleLayout(role) {
  const configurePage = document.getElementById("configurePage");
  const playPage = document.getElementById("playPage");
  const rankListArea = document.getElementById("rankListArea");
  const inventoryArea = document.getElementById("inventoryArea");
  const buttonArea = document.getElementById("buttonArea");

  const body = document.body;
  if (role === 0) {
    // CONFIGURE MODE
    body.classList.add("configure-mode");
    body.classList.remove("play-mode");
    setServerInfo();
  } else {
    // PLAY MODE
    body.classList.add("play-mode");
    body.classList.remove("configure-mode");
    
    if (role === 100) {
      body.classList.add("overview");
      groupId = 100;
    } else {
      body.classList.remove("overview");
    }
    initGlobalVars();
    startInventoryUpdates(role);
  }

  if (configurePage) {
    configurePage.hidden = role !== 0;
  }

  if (playPage) {
    playPage.hidden = role === 0;
  }

  const overviewMode = role === 100;
  if (rankListArea) {
    rankListArea.hidden = !overviewMode;
  }
  if (inventoryArea) {
    inventoryArea.hidden = overviewMode;
  }
  if (buttonArea) {
    buttonArea.hidden = overviewMode;
  }

  startFillRanklist();
}

$(function () {
  console.log("Document ready, initializing page...");
  renderRoleOptions();
  renderBuyButtons();
  renderActionButtons();

  $("#roleForm").on("submit", function (event) {
    event.preventDefault();
    $.post("/ajax/setRole", { setRole: $("#roleSelect").val() }).done(
      function () {
        window.location.reload();
      },
    );
  });

  $.getJSON("/ajax/getRole")
    .done(function (data) {
      const role = parseInt(data.role, 10) || 0;
      groupId = role;
      document.title =
        role === 0
          ? "Siedler - Konfiguration"
          : "Siedler - " +
            (role !== 100 ? config.group_names[`gr${role}`] : "Überblick");
      applyRoleLayout(role);

      const select = document.getElementById("roleSelect");
      if (select) {
        select.value = role === 0 ? "1" : String(role);
      }
    })
    .fail(function () {
      applyRoleLayout(0);
    });
});

function toggleDisplayScore() {
  $.get("/ajax/toggleDisplayScore").done(function (data) {
    console.log(data);
    alert("toggleDisplayScore: " + data.displayScore);
  });
}

function clearDB() {
  $.get("/ajax/clearDB").done(function (data) {
    console.log(data);
    alert(data.message);
  });
}

function initDB() {
  $.get("/ajax/initDB").done(function (data) {
    console.log(data);
    alert(data.message);
  });
}

function setServerInfo() {
  $.get("/ajax/getServerInfo")
    .done(function (data) {
      const ipList = document.getElementById("serverIpList");
      data.ip = data.ip.filter((ip) => ip.family === "IPv4" && !ip.internal); // Filter for external IPv4 addresses
      console.log("Filtered IPs:", data);
      if (ipList) {
        ipList.innerHTML = data.ip
          .map(
            (ip) =>
              `<li>${ip.interface} (${ip.family}): <a href="http://${ip.address}:${data.port}" target="_blank">${ip.address}:${data.port}</a> ${ip.internal ? "(internal)" : ""}</li>`,
          )
          .join("");
      }

      // Update server information fields
      const hostnameField = document.getElementById("serverHostname");
      const platformField = document.getElementById("serverPlatform");
      const archField = document.getElementById("serverArch");
      const serverPortField = document.getElementById("serverPort");

      if (hostnameField) {
        hostnameField.textContent = data.hostname;
      }
      if (platformField) {
        platformField.textContent = data.platform;
      }
      if (archField) {
        archField.textContent = data.arch;
      }
      if (serverPortField) {
        serverPortField.textContent = data.port;
      }
    })
    .fail(function () {
      console.error("Failed to fetch server info");
    });
}
