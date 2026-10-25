const $=s=>document.querySelector(s), $$=s=>document.querySelectorAll(s);

const toast=m=>{
    const t=$("#toast");
    if(!t)return;
    t.textContent=m;
    t.classList.add("show");
    setTimeout(()=>t.classList.remove("show"),2200);
};

const pages={
    dashboard:"Good evening, Kush 👋",
    timetable:"Weekly Timetable",
    tasks:"To-do List",
    notes:"Notes",
    attendance:"Attendance Tracker",
    cgpa:"CGPA Calculator",
    pomodoro:"Pomodoro Timer",
    announcements:"College Announcements",
    expenses:"Expense Tracker"
};

function updateDate(){
    const now=new Date();
    const days=["SUNDAY","MONDAY","TUESDAY","WEDNESDAY","THURSDAY","FRIDAY","SATURDAY"];
    const months=["JANUARY","FEBRUARY","MARCH","APRIL","MAY","JUNE","JULY","AUGUST","SEPTEMBER","OCTOBER","NOVEMBER","DECEMBER"];
    const date=$("#currentDate");
    if(date)date.textContent=`${days[now.getDay()]} · ${now.getDate()} ${months[now.getMonth()]} ${now.getFullYear()}`;
}

updateDate();

function go(id){
    $$(".page").forEach(p=>p.classList.remove("active-page"));
    const page=$("#"+id);
    if(page)page.classList.add("active-page");

    $$(".nav-item").forEach(b=>{
        b.classList.toggle("active",b.dataset.section===id);
    });

    if($("#pageTitle"))$("#pageTitle").textContent=pages[id]||id;
    window.scrollTo(0,0);
}

$$("[data-section]").forEach(b=>{
    b.onclick=()=>go(b.dataset.section);
});

$$("[data-go]").forEach(b=>{
    b.onclick=()=>go(b.dataset.go);
});

const authScreen=$("#authScreen");
const loginForm=$("#loginForm");
const registerForm=$("#registerForm");
const loginTab=$("#loginTab");
const registerTab=$("#registerTab");
const authTitle=$("#authTitle");
const authSubtitle=$("#authSubtitle");
const authMessage=$("#authMessage");

function showLogin(){
    if(!loginForm||!registerForm)return;

    loginForm.classList.remove("hidden");
    registerForm.classList.add("hidden");

    loginTab?.classList.add("active");
    registerTab?.classList.remove("active");

    if(authTitle)authTitle.textContent="Welcome back";
    if(authSubtitle)authSubtitle.textContent="Sign in to your student productivity cockpit.";

    if(authMessage){
        authMessage.textContent="";
        authMessage.style.color="";
    }
}

function showRegister(){
    if(!loginForm||!registerForm)return;

    loginForm.classList.add("hidden");
    registerForm.classList.remove("hidden");

    loginTab?.classList.remove("active");
    registerTab?.classList.add("active");

    if(authTitle)authTitle.textContent="Create your account";
    if(authSubtitle)authSubtitle.textContent="Set up your Campus Pilot student account.";

    if(authMessage){
        authMessage.textContent="";
        authMessage.style.color="";
    }
}

loginTab?.addEventListener("click",showLogin);
registerTab?.addEventListener("click",showRegister);

registerForm?.addEventListener("submit",function(e){
    e.preventDefault();

    const name=$("#registerName").value.trim();
    const email=$("#registerEmail").value.trim().toLowerCase();
    const password=$("#registerPassword").value;

    if(!name||!email||!password){
        authMessage.textContent="Please fill in all fields.";
        return;
    }

    if(password.length<6){
        authMessage.textContent="Password must be at least 6 characters.";
        return;
    }

    const user={
        name:name,
        email:email,
        password:password
    };

    localStorage.setItem("campusPilotUser",JSON.stringify(user));

    authMessage.style.color="#34d399";
    authMessage.textContent="Account created successfully!";

    $("#loginEmail").value=email;
    $("#loginPassword").value="";

    setTimeout(showLogin,1000);
});

loginForm?.addEventListener("submit",function(e){
    e.preventDefault();

    const email=$("#loginEmail").value.trim().toLowerCase();
    const password=$("#loginPassword").value;

    const raw=localStorage.getItem("campusPilotUser");
    const savedUser=raw?JSON.parse(raw):null;

    if(!savedUser){
        authMessage.textContent="No account found. Please register first.";
        return;
    }

    if(email!==savedUser.email||password!==savedUser.password){
        authMessage.textContent="Incorrect email or password.";
        return;
    }

    localStorage.setItem("campusPilotLoggedIn","true");

    authScreen?.classList.add("hidden");

    if($("#profileName"))$("#profileName").textContent=savedUser.name;
    if($("#profileAvatar"))$("#profileAvatar").textContent=savedUser.name.charAt(0).toUpperCase();

    toast("Welcome to Campus Pilot!");
});

$("#logoutBtn")?.addEventListener("click",function(){
    localStorage.removeItem("campusPilotLoggedIn");

    authScreen?.classList.remove("hidden");

    if($("#loginPassword"))$("#loginPassword").value="";

    showLogin();
});

const loggedIn=localStorage.getItem("campusPilotLoggedIn");
const savedUserRaw=localStorage.getItem("campusPilotUser");

if(loggedIn==="true"&&savedUserRaw){
    const user=JSON.parse(savedUserRaw);

    authScreen?.classList.add("hidden");

    if($("#profileName"))$("#profileName").textContent=user.name;
    if($("#profileAvatar"))$("#profileAvatar").textContent=user.name.charAt(0).toUpperCase();
}else{
    showLogin();
}

let tasks=[
    {t:"Finish Campus Pilot UI",d:"Frontend Engineering",done:true},
    {t:"Review OS lecture notes",d:"Operating Systems",done:true},
    {t:"Complete attendance tracker",d:"Project work",done:false},
    {t:"Practice JavaScript DOM",d:"Coding",done:false},
    {t:"Submit FEE project outline",d:"Deadline · Friday",done:false},
    {t:"Read AI Algorithms chapter",d:"Study",done:false},
    {t:"Update project README",d:"Project work",done:false}
];

function renderTasks(){
    const list=$("#taskList");
    const dash=$("#dashboardTasks");

    if(!list||!dash)return;

    list.innerHTML="";
    dash.innerHTML="";

    tasks.forEach((x,i)=>{
        const el=document.createElement("div");

        el.className="task-item "+(x.done?"done":"");

        el.innerHTML=`
            <button class="task-check">${x.done?"✓":""}</button>
            <div>
                <strong>${x.t}</strong>
                <small>${x.d}</small>
            </div>
        `;

        el.querySelector("button").onclick=()=>{
            tasks[i].done=!tasks[i].done;
            renderTasks();
            toast(tasks[i].done?"Task completed":"Task reopened");
        };

        list.appendChild(el);

        if(i<4){
            const copy=el.cloneNode(true);

            copy.querySelector("button").onclick=()=>{
                tasks[i].done=!tasks[i].done;
                renderTasks();
            };

            dash.appendChild(copy);
        }
    });

    const done=tasks.filter(x=>x.done).length;
    const pct=tasks.length?Math.round(done/tasks.length*100):0;

    if($("#taskProgress"))$("#taskProgress").textContent=pct+"%";
    if($("#taskProgressBar"))$("#taskProgressBar").style.width=pct+"%";
    if($("#dashTasks"))$("#dashTasks").textContent=`${done}/${tasks.length}`;
}

renderTasks();

$("#addTask")?.addEventListener("click",function(){
    const v=$("#taskInput").value.trim();

    if(!v)return;

    tasks.push({
        t:v,
        d:"Added just now",
        done:false
    });

    $("#taskInput").value="";

    renderTasks();

    toast("Task added");
});

$("#taskInput")?.addEventListener("keydown",function(e){
    if(e.key==="Enter")$("#addTask").click();
});

const notes=[
    ["Frontend Engineering II","DOM manipulation, events, localStorage and responsive UI patterns.","purple"],
    ["Operating Systems","Processes, CPU scheduling, memory management and Linux commands.","green"],
    ["AI Algorithms","Search algorithms, heuristics, complexity and problem solving.","blue"],
    ["Discrete Mathematics","Graphs, relations, sets, logic and combinatorics.","orange"],
    ["Project Ideas","Campus navigation, productivity dashboards and student tools.","purple"],
    ["Quick Revision","Important formulas, shortcuts and exam reminders.","green"]
];

function renderNotes(){
    const g=$("#notesGrid");

    if(!g)return;

    g.innerHTML=notes.map((n,i)=>`
        <article class="note-card" data-i="${i}">
            <div class="note-color" style="background:var(--${n[2]})"></div>
            <h4>${n[0]}</h4>
            <p>${n[1]}</p>
            <small>Updated today</small>
        </article>
    `).join("");

    g.querySelectorAll(".note-card").forEach(card=>{
        card.onclick=()=>{
            const i=Number(card.dataset.i);

            const title=prompt("Edit note title:",notes[i][0]);

            if(title===null)return;

            const content=prompt("Edit note:",notes[i][1]);

            if(content===null)return;

            notes[i][0]=title.trim()||"Untitled Note";
            notes[i][1]=content.trim()||"Empty note";

            renderNotes();

            toast("Note updated");
        };
    });
}

renderNotes();

$("#newNote")?.addEventListener("click",function(){
    const title=prompt("Enter note title:");

    if(!title)return;

    const content=prompt("Enter your note:");

    if(content===null)return;

    notes.unshift([
        title.trim()||"Untitled Note",
        content.trim()||"Empty note",
        "purple"
    ]);

    renderNotes();

    toast("New note created");
});

const grades=[
    ["Frontend Engineering II","A",4],
    ["Operating Systems","A-",4],
    ["Discrete Mathematics","B+",3],
    ["AI Algorithms","A",4]
];

const points={
    A:10,
    "A-":9,
    "B+":8,
    B:7,
    "B-":6,
    C:5
};

function renderGrades(){
    const g=$("#gradeRows");

    if(!g)return;

    g.innerHTML=grades.map((r,i)=>`
        <div class="grade-row">
            <input value="${r[0]}" data-i="${i}" data-k="0">
            <select data-i="${i}" data-k="1">
                ${Object.keys(points).map(x=>`
                    <option ${x===r[1]?"selected":""}>${x}</option>
                `).join("")}
            </select>
            <input type="number" value="${r[2]}" min="1" data-i="${i}" data-k="2">
            <button class="remove-grade" data-i="${i}">×</button>
        </div>
    `).join("");

    g.querySelectorAll("input,select").forEach(e=>{
        e.onchange=()=>{
            grades[e.dataset.i][e.dataset.k]=e.value;
        };
    });

    g.querySelectorAll(".remove-grade").forEach(e=>{
        e.onclick=()=>{
            grades.splice(e.dataset.i,1);
            renderGrades();
        };
    });
}

renderGrades();

$("#addGrade")?.addEventListener("click",function(){
    grades.push(["New Subject","A",3]);
    renderGrades();
});

$("#calculateCgpa")?.addEventListener("click",function(){
    let c=0;
    let p=0;

    grades.forEach(r=>{
        c+=Number(r[2]);
        p+=points[r[1]]*Number(r[2]);
    });

    const v=c?(p/c).toFixed(2):"0.00";

    if($("#cgpaResult"))$("#cgpaResult").textContent=v;
    if($("#dashCgpa"))$("#dashCgpa").textContent=v;

    toast("CGPA calculated");
});

let seconds=1500;
let timer=null;

function paintTimer(){
    const m=String(Math.floor(seconds/60)).padStart(2,"0");
    const s=String(seconds%60).padStart(2,"0");

    if($("#mainTimer"))$("#mainTimer").textContent=`${m}:${s}`;
    if($("#dashTimer"))$("#dashTimer").textContent=`${m}:${s}`;
}

function toggleTimer(){
    if(timer){
        clearInterval(timer);
        timer=null;

        if($("#startTimer"))$("#startTimer").textContent="Start";

        return;
    }

    if($("#startTimer"))$("#startTimer").textContent="Pause";

    timer=setInterval(()=>{
        if(seconds>0){
            seconds--;
            paintTimer();
        }else{
            clearInterval(timer);
            timer=null;

            if($("#startTimer"))$("#startTimer").textContent="Start";

            toast("Focus session complete 🎉");
        }
    },1000);
}

$("#startTimer")?.addEventListener("click",toggleTimer);

$("#resetTimer")?.addEventListener("click",function(){
    clearInterval(timer);

    timer=null;
    seconds=1500;

    paintTimer();

    if($("#startTimer"))$("#startTimer").textContent="Start";
});

$$(".timer-presets button").forEach((b,i)=>{
    b.onclick=()=>{
        clearInterval(timer);

        timer=null;

        seconds=[1500,900,3000][i];

        if($("#startTimer"))$("#startTimer").textContent="Start";

        $$(".timer-presets button").forEach(x=>x.classList.remove("active"));

        b.classList.add("active");

        paintTimer();
    };
});

paintTimer();

$("#themeBtn")?.addEventListener("click",function(){
    document.body.classList.toggle("dark");

    localStorage.setItem(
        "campusDark",
        document.body.classList.contains("dark")
    );

    toast(
        document.body.classList.contains("dark")
        ?"Dark mode on"
        :"Light mode on"
    );
});

if(localStorage.getItem("campusDark")==="true"){
    document.body.classList.add("dark");
}

$("#notificationBtn")?.addEventListener("click",()=>{
    toast("You have 3 new campus updates");
});

$("#addExpenseBtn")?.addEventListener("click",()=>{
    toast("Expense form ready");
});

const overlay=$("#searchOverlay");
const overlayInput=$("#overlaySearch");
const results=$("#searchResults");

const searchable=[
    ["Frontend Engineering II","Timetable · 10:15 AM · F-12 Lab","timetable"],
    ["Complete attendance tracker","Task · Project work","tasks"],
    ["Operating Systems","Note · Processes, CPU scheduling and Linux","notes"],
    ["FEE Evaluation registrations are open","Announcement · 2 hours ago","announcements"],
    ["Attendance Tracker","Academics · Overall 82%","attendance"],
    ["CGPA Calculator","Academics · Current 8.7","cgpa"],
    ["Expense Tracker","Finance · ₹4,280 this month","expenses"],
    ["Pomodoro Timer","Focus · 25 minute session","pomodoro"]
];

function search(v){
    if(!results)return;

    v=v.toLowerCase();

    results.innerHTML=searchable
        .filter(x=>
            x[0].toLowerCase().includes(v)||
            x[1].toLowerCase().includes(v)
        )
        .map(x=>`
            <div class="result" data-page="${x[2]}">
                <b>${x[0]}</b>
                <small>${x[1]}</small>
            </div>
        `)
        .join("")||`
            <div class="result">No results found.</div>
        `;

    results.querySelectorAll("[data-page]").forEach(e=>{
        e.onclick=()=>{
            overlay.classList.add("hidden");
            go(e.dataset.page);
        };
    });
}

$("#globalSearch")?.addEventListener("click",function(){
    if(!overlay||!overlayInput)return;

    overlay.classList.remove("hidden");
    overlayInput.focus();

    search("");
});

overlayInput?.addEventListener("input",e=>{
    search(e.target.value);
});

$("#closeSearch")?.addEventListener("click",()=>{
    overlay?.classList.add("hidden");
});

document.addEventListener("keydown",e=>{
    if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==="k"){
        e.preventDefault();

        overlay?.classList.remove("hidden");
        overlayInput?.focus();
    }

    if(e.key==="Escape"){
        overlay?.classList.add("hidden");
    }
});

$("#addClass")?.addEventListener("click",function(){
    const name=prompt("Enter class name:");

    if(!name)return;

    const time=prompt("Enter time:");

    if(!time)return;

    const room=prompt("Enter room:");

    if(!room)return;

    const teacher=prompt("Enter professor name:");

    if(!teacher)return;

    const card=document.createElement("div");

    card.className="schedule-card";

    card.innerHTML=`
        <span class="course-tag purple">NEW</span>
        <div>
            <strong>${name}</strong>
            <p>${time} · ${room}</p>
        </div>
        <span>${teacher}</span>
    `;

    $(".full-schedule")?.appendChild(card);

    toast("Class added");
});

if(window.Chart){
    const attendance=$("#attendanceChart");
    const expense=$("#expenseChart");

    if(attendance){
        new Chart(attendance,{
            type:"line",
            data:{
                labels:["Apr","May","Jun","Jul","Aug"],
                datasets:[{
                    label:"Attendance",
                    data:[74,76,78,80,82],
                    borderWidth:3,
                    tension:.35,
                    pointRadius:4
                }]
            },
            options:{
                plugins:{
                    legend:{
                        display:false
                    }
                },
                scales:{
                    y:{
                        min:65,
                        max:95,
                        ticks:{
                            font:{
                                size:9
                            }
                        }
                    },
                    x:{
                        ticks:{
                            font:{
                                size:9
                            }
                        }
                    }
                }
            }
        });
    }

    if(expense){
        new Chart(expense,{
            type:"doughnut",
            data:{
                labels:["Food","Transport","Study","Entertainment"],
                datasets:[{
                    data:[1860,920,800,700],
                    borderWidth:0
                }]
            },
            options:{
                plugins:{
                    legend:{
                        position:"right",
                        labels:{
                            font:{
                                size:10
                            },
                            boxWidth:10
                        }
                    }
                },
                cutout:"70%"
            }
        });
    }
}