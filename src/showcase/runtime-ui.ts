/**
 * Client-side UI interactivity for the component explorer, authored as a single
 * self-contained function inlined via `uiMain.toString()`. Vanilla DOM + event
 * delegation drive tabs, accordions, dialogs/sheets/drawers, menus/popovers,
 * a command palette, custom selects, toasts, a carousel, sliders, the theme
 * toggle, and scrollspy navigation. No dependencies.
 */

/* eslint-disable @typescript-eslint/no-explicit-any */
export function uiMain(): void {
  const $ = <T extends Element = HTMLElement>(sel: string, root: ParentNode = document) =>
    root.querySelector<T>(sel);
  const $$ = <T extends Element = HTMLElement>(sel: string, root: ParentNode = document) =>
    Array.from(root.querySelectorAll<T>(sel));
  const closest = (t: EventTarget | null, sel: string) => (t as Element | null)?.closest(sel) as HTMLElement | null;

  // ---- WCAG: apply ARIA roles + keyboard affordances on load ----
  $$("[data-tabs]").forEach((t) => {
    t.querySelector(".tabs-list")?.setAttribute("role", "tablist");
    $$("[data-tab]", t).forEach((tab) => {
      tab.setAttribute("role", "tab");
      const value = tab.getAttribute("data-tab")!;
      const panel = t.querySelector(`[data-tab-panel="${value}"]`);
      if (panel) {
        const pid = panel.id || `panel-${value}-${Math.round(t.getBoundingClientRect().top)}`;
        panel.id = pid;
        panel.setAttribute("role", "tabpanel");
        panel.setAttribute("tabindex", "0");
        tab.setAttribute("aria-controls", pid);
      }
    });
  });
  $$("[data-menu]").forEach((m) => m.setAttribute("role", "menu"));
  $$("[data-menu] .menu-item, [data-menu] [data-select-option], [data-menu] [data-cb-option]").forEach((mi) => mi.setAttribute("role", "menuitem"));
  $$("[data-menu-trigger]").forEach((t) => {
    t.setAttribute("aria-haspopup", "true");
    t.setAttribute("aria-expanded", "false");
  });
  $$(".overlay .dialog, .overlay .sheet, .overlay .drawer").forEach((d) => {
    d.setAttribute("role", "dialog");
    d.setAttribute("aria-modal", "true");
    const h = d.querySelector("h3");
    if (h) {
      const hid = h.id || `dlg-h-${Math.random().toString(36).slice(2, 7)}`;
      h.id = hid;
      d.setAttribute("aria-labelledby", hid);
    }
  });
  $$("#cmdk .cmd").forEach((c) => {
    c.setAttribute("role", "dialog");
    c.setAttribute("aria-label", "Command palette");
  });
  // WCAG 1.3.1/4.1.2: give every text control an accessible name.
  $$<HTMLInputElement>("input:not([type=hidden]):not([type=checkbox]):not([type=radio]), textarea, select").forEach((el) => {
    if (el.getAttribute("aria-label") || el.id || el.closest("label")) return;
    const field = el.closest(".field, .form-field, .auth-fld, .ai-composer, .input-icon");
    const prev = el.previousElementSibling?.classList.contains("label") ? el.previousElementSibling.textContent : "";
    const text = (field?.querySelector(".label")?.textContent || prev || "").trim();
    const name = text ? text.replace(/\s*\*$/, "") : el.getAttribute("placeholder");
    if (name) el.setAttribute("aria-label", name);
  });

  // Tabs: arrow-key navigation.
  document.addEventListener("keydown", (e) => {
    const tab = closest(e.target, "[data-tab]");
    if (!tab) return;
    const ke = e as KeyboardEvent;
    if (ke.key !== "ArrowRight" && ke.key !== "ArrowLeft") return;
    const tabs = $$("[data-tab]", tab.closest("[data-tabs]")!);
    const i = tabs.indexOf(tab);
    const next = tabs[(i + (ke.key === "ArrowRight" ? 1 : tabs.length - 1)) % tabs.length]!;
    next.focus();
    next.click();
  });

  // ---- theme toggle ----
  document.addEventListener("click", (e) => {
    if (closest(e.target, "[data-toggle-theme]")) document.documentElement.classList.toggle("dark");
  });

  // ---- tabs ----
  document.addEventListener("click", (e) => {
    const trigger = closest(e.target, "[data-tab]");
    if (!trigger) return;
    const wrap = trigger.closest("[data-tabs]");
    if (!wrap) return;
    const value = trigger.dataset.tab;
    $$("[data-tab]", wrap).forEach((t) => t.setAttribute("aria-selected", String(t === trigger)));
    $$("[data-tab-panel]", wrap).forEach((p) => {
      (p as HTMLElement).hidden = p.getAttribute("data-tab-panel") !== value;
    });
  });

  // ---- accordion / collapsible ----
  document.addEventListener("click", (e) => {
    const trigger = closest(e.target, "[data-acc-trigger]");
    if (!trigger) return;
    const item = trigger.closest("[data-acc-item]")!;
    const acc = trigger.closest("[data-accordion]");
    const open = item.classList.contains("open");
    if (acc?.getAttribute("data-accordion") === "single") {
      $$("[data-acc-item]", acc).forEach((it) => it.classList.remove("open"));
    }
    item.classList.toggle("open", !open);
    trigger.setAttribute("aria-expanded", String(!open));
  });

  // ---- tree view ----
  document.addEventListener("click", (e) => {
    const t = closest(e.target, "[data-tree-toggle]");
    if (t) t.closest(".tree-item")?.classList.toggle("open");
  });

  // ---- localization + RTL ----
  const I18N: Record<string, Record<string, string>> = {
    en: { label: "English", title: "World Economic Outlook", body: "Global growth is projected to hold at 3.2% in 2025.", cancel: "Cancel", read: "Read report" },
    fr: { label: "Français", title: "Perspectives de l'économie mondiale", body: "La croissance mondiale devrait se maintenir à 3,2 % en 2025.", cancel: "Annuler", read: "Lire le rapport" },
    es: { label: "Español", title: "Perspectivas de la economía mundial", body: "Se proyecta que el crecimiento mundial se mantenga en 3,2 % en 2025.", cancel: "Cancelar", read: "Leer informe" },
    ar: { label: "العربية", title: "آفاق الاقتصاد العالمي", body: "من المتوقع أن يبقى النمو العالمي عند 3.2٪ في عام 2025.", cancel: "إلغاء", read: "قراءة التقرير" },
  }
  document.addEventListener("click", (e) => {
    const opt = closest(e.target, "[data-lang]")
    if (!opt) return
    const t = I18N[opt.getAttribute("data-lang") ?? "en"]
    if (!t) return
    const dir = opt.getAttribute("data-dir") ?? "ltr"
    $$("[data-i18n-sample]").forEach((s) => {
      s.setAttribute("dir", dir)
      $$("[data-i18n]", s).forEach((el) => {
        const v = t[el.getAttribute("data-i18n") ?? ""]
        if (v) el.textContent = v
      })
    })
    $$("[data-lang-value]").forEach((v) => (v.textContent = t.label ?? ""))
    closeMenus()
  })

  // ---- overlays: dialog / alert-dialog / sheet / drawer ----
  let lastOpener: HTMLElement | null = null;
  const openOverlay = (id: string) => {
    const ov = document.getElementById(id);
    if (!ov) return;
    lastOpener = document.activeElement as HTMLElement | null;
    ov.classList.add("open");
    document.body.style.overflow = "hidden";
    // WCAG 2.4.3: move focus into the dialog.
    const focusable = ov.querySelector<HTMLElement>(
      "input:not([type=hidden]), textarea, button, [href], select, [tabindex]:not([tabindex='-1'])",
    );
    setTimeout(() => focusable?.focus(), 30);
  };
  const closeOverlay = (ov: Element | null) => {
    if (!ov) return;
    ov.classList.remove("open");
    if (!$(".overlay.open")) document.body.style.overflow = "";
    lastOpener?.focus?.();
  };
  document.addEventListener("click", (e) => {
    const opener = closest(e.target, "[data-open]");
    if (opener) {
      openOverlay(opener.dataset.open!);
      return;
    }
    if (closest(e.target, "[data-close]")) {
      closeOverlay(closest(e.target, ".overlay"));
      return;
    }
    const ov = e.target as HTMLElement;
    if (ov.classList?.contains("overlay") && ov.classList.contains("open")) closeOverlay(ov);
  });

  // ---- menus / popovers / dropdowns / hover cards ----
  const closeMenus = (except?: Element | null) => {
    $$("[data-menu].open").forEach((m) => {
      if (m !== except) {
        m.classList.remove("open");
        (m.parentElement?.querySelector("[data-menu-trigger]"))?.setAttribute("aria-expanded", "false");
      }
    });
  };
  document.addEventListener("click", (e) => {
    const trigger = closest(e.target, "[data-menu-trigger]");
    if (trigger) {
      const menu = trigger.parentElement?.querySelector("[data-menu]") as HTMLElement | null;
      const isOpen = menu?.classList.contains("open");
      closeMenus(menu);
      menu?.classList.toggle("open", !isOpen);
      trigger.setAttribute("aria-expanded", String(!isOpen));
      return;
    }
    if (!closest(e.target, "[data-menu]")) closeMenus();
    // select option chosen
    const opt = closest(e.target, "[data-select-option]");
    if (opt) {
      const wrap = opt.closest("[data-select]")!;
      const label = $("[data-select-value]", wrap)!;
      label.textContent = opt.textContent;
      $$("[data-select-option]", wrap).forEach((o) => o.classList.toggle("selected", o === opt));
      closeMenus();
    }
  });
  // context menu
  document.addEventListener("contextmenu", (e) => {
    const host = closest(e.target, "[data-context]");
    if (!host) return;
    e.preventDefault();
    const menu = host.querySelector("[data-menu]") as HTMLElement | null;
    if (!menu) return;
    closeMenus(menu);
    menu.style.position = "fixed";
    menu.style.left = Math.min(e.clientX, window.innerWidth - 200) + "px";
    menu.style.top = e.clientY + "px";
    menu.classList.add("open");
  });

  // ---- command palette ----
  const cmd = document.getElementById("cmdk");
  document.addEventListener("keydown", (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
      e.preventDefault();
      if (cmd) {
        cmd.classList.toggle("open");
        if (cmd.classList.contains("open")) setTimeout(() => $<HTMLInputElement>("[data-cmd-input]", cmd)?.focus(), 20);
      }
    }
    if (e.key === "Escape") {
      $$(".overlay.open").forEach((o) => o.classList.remove("open"));
      cmd?.classList.remove("open");
      closeMenus();
      document.body.style.overflow = "";
    }
  });
  if (cmd) {
    cmd.addEventListener("input", (e) => {
      const q = (e.target as HTMLInputElement).value?.toLowerCase() ?? "";
      $$("[data-cmd-item]", cmd).forEach((it) => {
        (it as HTMLElement).hidden = !it.textContent?.toLowerCase().includes(q);
      });
    });
    cmd.addEventListener("click", (e) => {
      if ((e.target as HTMLElement).id === "cmdk") cmd.classList.remove("open");
    });
  }

  // ---- toasts ----
  let toaster = document.getElementById("toaster");
  if (!toaster) {
    toaster = document.createElement("div");
    toaster.id = "toaster";
    toaster.className = "toaster";
    document.body.appendChild(toaster);
  }
  document.addEventListener("click", (e) => {
    const btn = closest(e.target, "[data-toast]");
    if (!btn) return;
    const t = document.createElement("div");
    t.className = "toast";
    t.innerHTML = `<div><strong>${btn.dataset.toastTitle || "Notification"}</strong><div class="muted" style="font-size:.8rem">${btn.dataset.toast || "Event has been created."}</div></div>`;
    toaster!.appendChild(t);
    requestAnimationFrame(() => t.classList.add("show"));
    setTimeout(() => {
      t.classList.remove("show");
      setTimeout(() => t.remove(), 250);
    }, 3200);
  });

  // ---- chat ----
  const clock = () => {
    const d = new Date()
    return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`
  }
  const CHAT_REPLIES = [
    "Global growth is projected at 3.2% for 2025, broadly stable.",
    "Headline inflation continues to ease toward central-bank targets.",
    "That series is in the WEO database — I can export it for you.",
    "Public debt is approaching 93% of GDP globally.",
  ]
  document.addEventListener("submit", (e) => {
    const form = closest(e.target, "[data-chat-form]")
    if (!form) return
    e.preventDefault()
    const input = form.querySelector<HTMLInputElement>("[data-chat-text]")
    const body = form.closest("[data-chat]")?.querySelector("[data-chat-body]") as HTMLElement | null
    if (!input || !body) return
    const text = input.value.trim()
    if (!text) return
    const add = (cls: string, content: string) => {
      const m = document.createElement("div")
      m.className = "msg " + cls
      m.innerHTML = `<div class="bubble"></div><span class="msg-time">${clock()}</span>`
      m.querySelector(".bubble")!.textContent = content // textContent avoids injection
      body.appendChild(m)
      body.scrollTop = body.scrollHeight
      return m
    }
    add("out", text)
    input.value = ""
    const typing = document.createElement("div")
    typing.className = "msg in"
    typing.innerHTML = `<div class="chat-typing"><span></span><span></span><span></span></div>`
    body.appendChild(typing)
    body.scrollTop = body.scrollHeight
    const reply = CHAT_REPLIES[text.length % CHAT_REPLIES.length]!
    setTimeout(() => {
      typing.remove()
      add("in", reply)
    }, 900)
  })

  // ---- toggle / toggle group ----
  document.addEventListener("click", (e) => {
    const tg = closest(e.target, "[data-toggle]");
    if (!tg) return;
    const group = tg.closest("[data-toggle-group='single']");
    if (group) $$("[data-toggle]", group).forEach((b) => b.classList.remove("on"));
    tg.classList.toggle("on");
  });

  // ---- combobox / multiselect / datepicker ----
  document.addEventListener("input", (e) => {
    const s = closest(e.target, "[data-cb-search]") as HTMLInputElement | null
    if (!s) return
    const q = s.value.toLowerCase()
    s.parentElement?.querySelectorAll<HTMLElement>("[data-cb-option]").forEach((o) => {
      o.hidden = !(o.textContent ?? "").toLowerCase().includes(q)
    })
  })
  document.addEventListener("click", (e) => {
    const opt = closest(e.target, "[data-cb-option]")
    if (opt) {
      const box = opt.closest("[data-combobox]")
      const label = box?.querySelector("[data-combobox-value]")
      if (label) {
        label.textContent = opt.textContent
        label.classList.remove("ph")
      }
      closeMenus()
      return
    }
    const day = closest(e.target, ".cal .day")
    if (day && !day.classList.contains("out")) {
      const dp = day.closest("[data-datepicker]")
      if (dp) {
        day.closest(".cal-grid")?.querySelectorAll(".day").forEach((d) => d.classList.remove("sel"))
        day.classList.add("sel")
        const val = dp.querySelector("[data-dp-value]")
        if (val) {
          val.textContent = `September ${day.textContent}, 2026`
          val.classList.remove("ph")
        }
        closeMenus()
      }
    }
  })
  document.addEventListener("change", (e) => {
    const opt = closest(e.target, "[data-ms-option]") as HTMLInputElement | null
    if (!opt) return
    const box = opt.closest("[data-multiselect]")
    const chips = box?.querySelector("[data-ms-chips]")
    if (!box || !chips) return
    const checked = $$<HTMLInputElement>("[data-ms-option]", box).filter((c) => c.checked)
    chips.innerHTML = checked.length
      ? checked.map((c) => `<span class="chip-mini">${c.value}</span>`).join("")
      : `<span class="ph">Select regions…</span>`
  })

  // ---- input OTP ----
  $$("[data-otp]").forEach((otp) => {
    const inputs = $$<HTMLInputElement>("input", otp)
    otp.addEventListener("input", (e) => {
      const t = e.target as HTMLInputElement
      t.value = t.value.replace(/\D/g, "").slice(0, 1)
      if (t.value) inputs[inputs.indexOf(t) + 1]?.focus()
    })
    otp.addEventListener("keydown", (e) => {
      const t = e.target as HTMLInputElement
      if ((e as KeyboardEvent).key === "Backspace" && !t.value) inputs[inputs.indexOf(t) - 1]?.focus()
    })
    otp.addEventListener("paste", (e) => {
      e.preventDefault()
      const txt = (((e as ClipboardEvent).clipboardData?.getData("text") ?? "").match(/\d/g) ?? []).slice(0, inputs.length)
      inputs.forEach((inp, i) => (inp.value = txt[i] ?? ""))
      inputs[Math.min(txt.length, inputs.length - 1)]?.focus()
    })
  })

  // ---- password: show/hide + strength ----
  document.addEventListener("click", (e) => {
    const t = closest(e.target, "[data-toggle-pw]")
    if (!t) return
    const inp = t.parentElement?.querySelector("input") as HTMLInputElement | null
    if (inp) inp.type = inp.type === "password" ? "text" : "password"
  })
  const PW_COLORS = ["transparent", "var(--destructive)", "var(--chart-3)", "var(--chart-1)", "var(--chart-5)"]
  const PW_HINTS = ["", "Weak — add length and variety.", "Fair — add numbers or symbols.", "Good.", "Strong password."]
  document.addEventListener("input", (e) => {
    const inp = closest(e.target, "[data-password]") as HTMLInputElement | null
    if (!inp) return
    const v = inp.value
    let score = 0
    if (v.length >= 8) score++
    if (/[a-z]/.test(v) && /[A-Z]/.test(v)) score++
    if (/\d/.test(v)) score++
    if (/[^A-Za-z0-9]/.test(v)) score++
    const field = inp.closest(".field, .form-field")
    const bar = field?.querySelector("[data-pw-bar]") as HTMLElement | null
    if (bar) {
      bar.style.width = `${(score / 4) * 100}%`
      bar.style.background = PW_COLORS[score]!
    }
    const hint = field?.querySelector("[data-pw-hint]")
    if (hint && v) hint.textContent = PW_HINTS[score]!
  })

  // ---- inline email validation ----
  document.addEventListener("input", (e) => {
    const inp = closest(e.target, "[data-validate='email']") as HTMLInputElement | null
    if (!inp) return
    const ok = inp.value === "" || /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(inp.value)
    inp.classList.toggle("invalid", !ok)
    const err = inp.closest(".form-field")?.querySelector("[data-err]") as HTMLElement | null
    if (err) err.hidden = ok
  })

  // ---- file dropzone ----
  $$("[data-dropzone]").forEach((dz) => {
    const input = $<HTMLInputElement>("[data-dz-input]", dz)
    const fileEl = $("[data-dz-file]", dz)
    const show = (name: string) => {
      if (fileEl) {
        ;(fileEl as HTMLElement).hidden = false
        fileEl.textContent = "✓ " + name
      }
    }
    input?.addEventListener("change", () => {
      if (input.files?.[0]) show(input.files[0].name)
    })
    ;["dragover", "dragenter"].forEach((ev) =>
      dz.addEventListener(ev, (e) => {
        e.preventDefault()
        dz.classList.add("drag")
      }),
    )
    ;["dragleave", "drop"].forEach((ev) =>
      dz.addEventListener(ev, (e) => {
        e.preventDefault()
        dz.classList.remove("drag")
      }),
    )
    dz.addEventListener("drop", (e) => {
      const f = (e as DragEvent).dataTransfer?.files?.[0]
      if (f) show(f.name)
    })
  })

  // ---- tags input ----
  document.addEventListener("keydown", (e) => {
    const inp = closest(e.target, "[data-tags-input]") as HTMLInputElement | null
    if (!inp || (e as KeyboardEvent).key !== "Enter") return
    e.preventDefault()
    const v = inp.value.trim()
    if (!v) return
    const chip = document.createElement("span")
    chip.className = "tag"
    chip.append(v)
    const b = document.createElement("button")
    b.setAttribute("data-tag-remove", "")
    b.setAttribute("aria-label", "remove")
    b.textContent = "×"
    chip.append(b)
    inp.parentElement?.insertBefore(chip, inp)
    inp.value = ""
  })
  document.addEventListener("click", (e) => {
    const rm = closest(e.target, "[data-tag-remove]")
    if (rm) rm.closest(".tag")?.remove()
  })

  // ---- search clear + segmented ----
  document.addEventListener("input", (e) => {
    const inp = closest(e.target, "[data-search-input]") as HTMLInputElement | null
    if (inp) inp.closest("[data-search]")?.classList.toggle("has-value", inp.value.length > 0)
  })
  document.addEventListener("click", (e) => {
    const c = closest(e.target, "[data-search-clear]")
    if (c) {
      const box = c.closest("[data-search]")
      const inp = box?.querySelector("[data-search-input]") as HTMLInputElement | null
      if (inp) {
        inp.value = ""
        box?.classList.remove("has-value")
        inp.focus()
      }
      return
    }
    const seg = closest(e.target, "[data-segmented] button")
    if (seg) {
      $$("button", seg.closest("[data-segmented]")!).forEach((x) => x.classList.remove("on"))
      seg.classList.add("on")
    }
  })

  // ---- carousel ----
  $$("[data-carousel]").forEach((car) => {
    const track = $("[data-carousel-track]", car)!;
    let idx = 0;
    const count = $$("[data-carousel-item]", car).length;
    const go = (n: number) => {
      idx = (n + count) % count;
      track.style.transform = `translateX(-${idx * 100}%)`;
    };
    car.addEventListener("click", (e) => {
      if (closest(e.target, "[data-carousel-next]")) go(idx + 1);
      if (closest(e.target, "[data-carousel-prev]")) go(idx - 1);
    });
  });

  // ---- sliders ----
  $$<HTMLInputElement>("[data-slider]").forEach((s) => {
    const out = s.parentElement?.querySelector("[data-slider-value]");
    const upd = () => {
      if (out) out.textContent = s.value;
      const pct = ((+s.value - +s.min) / (+s.max - +s.min)) * 100;
      s.style.background = `linear-gradient(to right, var(--primary) ${pct}%, var(--secondary) ${pct}%)`;
    };
    s.addEventListener("input", upd);
    upd();
  });

  // ---- pagination (visual active) ----
  document.addEventListener("click", (e) => {
    const p = closest(e.target, "[data-page]");
    if (!p) return;
    const nav = p.closest("[data-pagination]");
    if (nav) $$("[data-page]", nav).forEach((x) => x.classList.toggle("active", x === p));
  });

  // ---- AI harness: streaming composer ----
  $$("[data-ai-shell]").forEach((shell) => {
    const convo = shell.querySelector("[data-ai-convo]") as HTMLElement | null
    const input = shell.querySelector("[data-ai-input]") as HTMLTextAreaElement | null
    const send = shell.querySelector("[data-ai-send]") as HTMLElement | null
    if (!convo || !input || !send) return
    let timer = 0
    const scroll = () => {
      convo.scrollTop = convo.scrollHeight
    }
    const REPLY =
      "Here's how I'd approach that. I'll add the chart component, wire it to the WEO series, and keep it token-driven so it matches the theme — then verify the projection band renders."
    const submit = () => {
      if (timer) {
        clearInterval(timer)
        timer = 0
        send.classList.remove("stop")
        send.textContent = "↑"
        convo.querySelector(".ai-cursor")?.remove()
        return
      }
      const text = input.value.trim()
      if (!text) return
      convo.insertAdjacentHTML(
        "beforeend",
        `<div class="ai-msg user"><div class="ai-avatar">FC</div><div class="ai-body"><div class="ai-role">You</div><div class="ai-content"></div></div></div>`,
      )
      ;(convo.lastElementChild!.querySelector(".ai-content") as HTMLElement).textContent = text
      input.value = ""
      input.style.height = "auto"
      scroll()
      convo.insertAdjacentHTML(
        "beforeend",
        `<div class="ai-msg assistant"><div class="ai-avatar">◆</div><div class="ai-body"><div class="ai-role">Analyst</div><div class="ai-content"><span class="ai-stream"></span><span class="ai-cursor"></span></div></div></div>`,
      )
      const contentEl = convo.lastElementChild!.querySelector(".ai-content") as HTMLElement
      const streamEl = contentEl.querySelector(".ai-stream") as HTMLElement
      send.classList.add("stop")
      send.textContent = "■"
      let i = 0
      timer = window.setInterval(() => {
        i += 2
        streamEl.textContent = REPLY.slice(0, i)
        scroll()
        if (i >= REPLY.length) {
          clearInterval(timer)
          timer = 0
          contentEl.querySelector(".ai-cursor")?.remove()
          send.classList.remove("stop")
          send.textContent = "↑"
        }
      }, 20)
    }
    send.addEventListener("click", submit)
    input.addEventListener("keydown", (e) => {
      const ke = e as KeyboardEvent
      if ((ke.metaKey || ke.ctrlKey) && ke.key === "Enter") {
        e.preventDefault()
        submit()
      }
    })
    input.addEventListener("input", () => {
      input.style.height = "auto"
      input.style.height = Math.min(input.scrollHeight, 140) + "px"
    })
  })

  // ---- AI harness: collapsibles, copy, votes, suggestions, model ----
  document.addEventListener("click", (e) => {
    const toolT = closest(e.target, "[data-ai-tool-toggle]")
    if (toolT) return void toolT.closest(".ai-tool")?.classList.toggle("open")
    const rez = closest(e.target, "[data-ai-reasoning-toggle]")
    if (rez) return void rez.closest(".ai-reasoning")?.classList.toggle("open")
    const vote = closest(e.target, "[data-ai-vote]")
    if (vote) {
      vote.parentElement?.querySelectorAll("[data-ai-vote]").forEach((v) => v.classList.remove("on"))
      vote.classList.add("on")
      return
    }
    const copyCode = closest(e.target, "[data-ai-copy-code]")
    if (copyCode) {
      const code = copyCode.closest(".ai-code")?.querySelector("code")?.textContent ?? ""
      navigator.clipboard?.writeText(code).catch(() => {})
      copyCode.textContent = "✓ Copied"
      setTimeout(() => (copyCode.textContent = "⧉ Copy"), 1200)
      return
    }
    const copyMsg = closest(e.target, "[data-ai-copy]")
    if (copyMsg) {
      const c = copyMsg.closest(".ai-body")?.querySelector(".ai-content")?.textContent ?? ""
      navigator.clipboard?.writeText(c).catch(() => {})
      copyMsg.classList.add("on")
      setTimeout(() => copyMsg.classList.remove("on"), 1000)
      return
    }
    const sugg = closest(e.target, "[data-ai-suggest]")
    if (sugg) {
      const wrap = sugg.closest(".ai-empty")?.parentElement
      const inp = wrap?.querySelector("[data-ai-input]") as HTMLTextAreaElement | null
      if (inp) {
        inp.value = (sugg.textContent ?? "").replace(/^\S+\s/, "")
        inp.focus()
      }
      return
    }
    const model = closest(e.target, "[data-ai-model-option]")
    if (model) {
      const label = model.closest(".ai-model")?.querySelector("[data-ai-model-value]")
      if (label) label.textContent = model.textContent
      closeMenus()
    }
  })

  // ---- data table: sort / filter / select / paginate / export ----
  $$("[data-datatable]").forEach((dt) => {
    const body = dt.querySelector("[data-dt-body]") as HTMLElement | null
    if (!body) return
    const allRows = $$<HTMLTableRowElement>("tr", body)
    const pageSize = parseInt(dt.getAttribute("data-page-size") || "6", 10)
    const search = dt.querySelector("[data-dt-search]") as HTMLInputElement | null
    const countEl = dt.querySelector("[data-dt-count]")
    const pager = dt.querySelector("[data-dt-pager]") as HTMLElement | null
    const selCount = dt.querySelector("[data-dt-selected]")
    const allCheck = dt.querySelector("[data-dt-all]") as HTMLInputElement | null
    let sortCol = -1
    let sortDir = 1
    let page = 1
    let q = ""

    const filtered = () => allRows.filter((r) => !q || (r.textContent ?? "").toLowerCase().includes(q))
    const cellVal = (r: HTMLTableRowElement, col: number, num: boolean) => {
      const t = (r.children[col] as HTMLElement)?.textContent?.trim() ?? ""
      return num ? parseFloat(t) : t.toLowerCase()
    }
    const updateSel = () => {
      const rowsSel = $$<HTMLInputElement>("[data-dt-row]", body).filter((c) => c.checked)
      if (selCount) selCount.textContent = `${rowsSel.length} selected`
      allRows.forEach((r) => r.classList.toggle("selected", !!(r.querySelector("[data-dt-row]") as HTMLInputElement | null)?.checked))
    }

    const render = () => {
      let rows = filtered()
      if (sortCol >= 0) {
        const num = dt.querySelector(`[data-dt-sort="${sortCol}"]`)?.getAttribute("data-dt-type") === "num"
        rows = [...rows].sort((a, b) => {
          const av = cellVal(a, sortCol, num)
          const bv = cellVal(b, sortCol, num)
          return (av < bv ? -1 : av > bv ? 1 : 0) * sortDir
        })
      }
      rows.forEach((r) => body.appendChild(r))
      allRows.forEach((r) => (r.style.display = "none"))
      const totalPages = Math.max(1, Math.ceil(rows.length / pageSize))
      if (page > totalPages) page = totalPages
      rows.slice((page - 1) * pageSize, page * pageSize).forEach((r) => (r.style.display = ""))
      if (countEl) countEl.textContent = `${rows.length} rows`
      if (pager) {
        pager.textContent = ""
        const mk = (label: string, p: number, active: boolean, disabled: boolean) => {
          const b = document.createElement("span")
          b.setAttribute("data-page", "")
          if (active) b.classList.add("active")
          if (disabled) b.style.opacity = "0.4"
          else b.addEventListener("click", () => { page = p; render() })
          b.textContent = label
          return b
        }
        pager.appendChild(mk("‹", page - 1, false, page <= 1))
        for (let p = 1; p <= totalPages; p++) pager.appendChild(mk(String(p), p, p === page, false))
        pager.appendChild(mk("›", page + 1, false, page >= totalPages))
      }
    }

    search?.addEventListener("input", () => { q = search.value.toLowerCase(); page = 1; render() })
    $$("[data-dt-sort]", dt).forEach((th) =>
      th.addEventListener("click", () => {
        const col = parseInt(th.getAttribute("data-dt-sort")!, 10)
        if (sortCol === col) sortDir *= -1
        else { sortCol = col; sortDir = 1 }
        $$("[data-dt-sort]", dt).forEach((h) => h.classList.remove("asc", "desc"))
        th.classList.add(sortDir > 0 ? "asc" : "desc")
        render()
      }),
    )
    body.addEventListener("change", (e) => { if (closest(e.target, "[data-dt-row]")) updateSel() })
    allCheck?.addEventListener("change", () => {
      $$<HTMLInputElement>("[data-dt-row]", body).forEach((c) => {
        if ((c.closest("tr") as HTMLElement).style.display !== "none") c.checked = allCheck.checked
      })
      updateSel()
    })
    dt.querySelector("[data-dt-export]")?.addEventListener("click", () => {
      const header = $$("th", dt).map((h) => (h.textContent ?? "").replace(/\s+/g, " ").trim()).filter((t) => t)
      const lines = [header.join(",")]
      filtered().forEach((r) => {
        lines.push(Array.from(r.children).slice(1).map((c) => `"${(c as HTMLElement).textContent?.trim() ?? ""}"`).join(","))
      })
      const blob = new Blob([lines.join("\n")], { type: "text/csv" })
      const a = document.createElement("a")
      a.href = URL.createObjectURL(blob)
      a.download = "data.csv"
      a.click()
      URL.revokeObjectURL(a.href)
    })

    render()
  })

  // ---- scrollspy sidebar ----
  const links = $$<HTMLAnchorElement>("[data-nav-link]");
  const sections = links.map((l) => document.getElementById(l.getAttribute("href")!.slice(1))).filter(Boolean) as HTMLElement[];
  if ("IntersectionObserver" in window && sections.length) {
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((en) => {
          if (en.isIntersecting) {
            const id = (en.target as HTMLElement).id;
            links.forEach((l) => l.classList.toggle("active", l.getAttribute("href") === "#" + id));
          }
        });
      },
      { rootMargin: "-20% 0px -70% 0px", threshold: 0 },
    );
    sections.forEach((s) => obs.observe(s));
  }
  document.addEventListener("click", (e) => {
    const link = closest(e.target, "[data-nav-link]") as HTMLAnchorElement | null;
    if (!link) return;
    const target = document.getElementById(link.getAttribute("href")!.slice(1));
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  });
}
