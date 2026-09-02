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

  // ---- overlays: dialog / alert-dialog / sheet / drawer ----
  const openOverlay = (id: string) => {
    const ov = document.getElementById(id);
    if (ov) {
      ov.classList.add("open");
      document.body.style.overflow = "hidden";
    }
  };
  const closeOverlay = (ov: Element | null) => {
    if (!ov) return;
    ov.classList.remove("open");
    if (!$(".overlay.open")) document.body.style.overflow = "";
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
      if (m !== except) m.classList.remove("open");
    });
  };
  document.addEventListener("click", (e) => {
    const trigger = closest(e.target, "[data-menu-trigger]");
    if (trigger) {
      const menu = trigger.parentElement?.querySelector("[data-menu]") as HTMLElement | null;
      const isOpen = menu?.classList.contains("open");
      closeMenus(menu);
      menu?.classList.toggle("open", !isOpen);
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
