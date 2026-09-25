// Shared behavior for every "order a part/kit" form across the four sites:
// live total from .order-products rows, generic FormData -> JSON submit to
// the form's own `action`, and a status message using theme.css's
// .form-status[data-state] styling. Each site keeps its own field `name`
// attributes (matching its own backend function) — this script never reads
// or hardcodes individual field names, only structural classes/ids, so one
// script works for every site's own contract.
(function () {
  var form = document.querySelector(".order-form");
  if (!form) return;

  var rows = Array.prototype.slice.call(form.querySelectorAll(".order-products tbody tr"));
  var totalEl = document.getElementById("order-total");
  var statusEl = document.getElementById("order-form-status");

  function recalcTotal() {
    var total = 0;
    rows.forEach(function (row) {
      var price = parseFloat(row.getAttribute("data-price")) || 0;
      var qtyInput = row.querySelector(".qty");
      var qty = qtyInput ? parseInt(qtyInput.value, 10) || 0 : 0;
      total += price * qty;
    });
    if (totalEl) totalEl.textContent = "$" + total.toFixed(2);
    return total;
  }

  rows.forEach(function (row) {
    var qtyInput = row.querySelector(".qty");
    if (qtyInput) qtyInput.addEventListener("input", recalcTotal);
  });
  recalcTotal();

  function setStatus(state, message) {
    if (!statusEl) return;
    statusEl.hidden = false;
    statusEl.textContent = message;
    statusEl.setAttribute("data-state", state);
  }

  form.addEventListener("submit", function (event) {
    event.preventDefault();

    var formData = new FormData(form);
    var payload = {};
    formData.forEach(function (value, key) {
      payload[key] = value;
    });
    payload.total = recalcTotal().toFixed(2);

    var submitBtn = form.querySelector('button[type="submit"]');
    if (submitBtn) submitBtn.disabled = true;
    setStatus("pending", "Sending…");

    fetch(form.getAttribute("action"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })
      .then(function (res) {
        return res.json().then(function (body) {
          return { ok: res.ok, body: body };
        });
      })
      .then(function (result) {
        if (submitBtn) submitBtn.disabled = false;
        if (result.ok) {
          setStatus("success", "Thank you — your order has been sent.");
          form.reset();
          recalcTotal();
        } else {
          setStatus("error", (result.body && result.body.error) || "Something went wrong. Please try again or call us directly.");
        }
      })
      .catch(function () {
        if (submitBtn) submitBtn.disabled = false;
        setStatus("error", "Network error. Please try again or call us directly.");
      });
  });
})();
