var globalId="";
var chart1=null;
var chart2=null;

function inputFunction(){
    var userId=document.getElementById("user").value ;
    globalId=userId;
    try{
    main(userId)
    }
    catch(e){
        alert("Invalid Input")
    }
    if (chart1 != null) chart1.destroy();
    if (chart2 != null) chart2.destroy();
}

async function main(userId){

    url = `https://api.github.com/users/${userId}`;
    let userInfo = await getRequest(url).catch(error => console.error(error));

    url = `https://api.github.com/users/${userId}/repos`;
    let userInfo_lang = await getRequest(url).catch(error => console.error(error));

    userInfo_col(userInfo,userInfo_lang);
    repoSearchBox(); 
}

async function getRequest(url) {
    let token='';                   //INSERT TOKEN WITHIN ''
    const headers = {
        'Authorization': `Token ${token}`
    }

    const response = (token == undefined ||token=='') ? await fetch(url) : await fetch(url, {
        "method": "GET",
        "headers": headers
    });

    let data = await response.json();
    return data;
}

//sidebar with all information of user
function userInfo_col(userInfo,userInfo2){
    let img = document.getElementById('img');
    img.src = userInfo.avatar_url

    let name = document.getElementById('name');
    name.innerHTML = `<b>Name: </b>${userInfo.name}`;

    let username = document.getElementById('userName');
    username.innerHTML = `<b>Username: </b>${userInfo.login}`;

    let bio = document.getElementById('bio');
    userInfo.bio !== null ? bio.innerHTML = `<b>Bio: </b>${userInfo.bio}`: "";  
    
    let followers = document.getElementById('followers');
    followers.innerHTML = `<b>Followers: </b>${userInfo.followers}`;

    let following = document.getElementById('following');
    following.innerHTML = `<b>Following: </b>${userInfo.following}`;

    let location = document.getElementById('location');
    userInfo.location !== null ? location.innerHTML = `<b>Location: </b>${userInfo.location}`: "";    

    let public_repos = document.getElementById('public_repos');
    public_repos.innerHTML = `<b>Public Repositories: </b>${userInfo.public_repos}`;

    get_all_languages(userInfo2);
}

function repoSearchBox(){
    document.getElementById("repoSearchBox").style.display = "block";
    
}

async function show(value){    
    url=`https://api.github.com/users/${globalId}/repos`;
    let repoInfo=await getRequest(url).catch(error => console.error(error)); 

    document.getElementById("datalist").innerHTML="";
    for(let i=0;i<repoInfo.length;i++){
        if((((repoInfo[i].name).toLowerCase()).indexOf(value.toLowerCase()))>-1){
            var n=document.createElement("option");
            var v=document.createTextNode(repoInfo[i].name);
            n.appendChild(v);
            document.getElementById("datalist").appendChild(n);

        }
    }
}

async function findRepo(){

    if (chart1 != null) chart1.destroy();    
    if (chart2 != null) chart2.destroy(); 

    var repoName=document.getElementById("repo").value ;

    url=`https://api.github.com/repos/${globalId}/${repoName}/languages`;
    let repoInfo=await getRequest(url).catch(error => console.error(error));
    get_languages(repoInfo);

    url=`https://api.github.com/repos/${globalId}/${repoName}/stats/contributors`;
    repoInfo=await getRequest(url).catch(error => console.error(error));
    get_graph(repoInfo);
   
}
async function get_all_languages(repo) {
    let label = [];
    let data = [];
    let backgroundColor = [];

    for (i in repo) {
        let url = `https://api.github.com/repos/${globalId}/${repo[i].name}/languages`;
        let languages = await getRequest(url).catch(error => console.error(error));

        for (language in languages) {

            if (label.includes(language)) {
                for (i = 0; i < label.length; i++)
                    if (language == label[i])
                        data[i] = data[i] + languages[language];

            } else {
                label.push(language);
                data.push(languages[language]);
                backgroundColor.push(`rgba(${Math.floor(Math.random() * 256)}, ${Math.floor(Math.random() * 256)}, ${Math.floor(Math.random() * 256)}, 0.5)`);
            }
        }

    }
    draw1('language1', 'doughnut', 'languages', "Languages used by "+ globalId, label, data, backgroundColor);
}

async function get_languages(repo) {
    let label = [];
    let data = [];
    let backgroundColor = [];
    let languages=repo;

        for (language in languages) {
            
            if (label.includes(language)) {
                for (i = 0; i < label.length; i++)
                    if (language == label[i])
                        data[i] = data[i] + languages[language];

            } else {
                label.push(language);
                data.push(languages[language]);
                backgroundColor.push(`rgba(${Math.floor(Math.random() * 256)}, ${Math.floor(Math.random() * 256)}, ${Math.floor(Math.random() * 256)}, 0.5)`);       
            }
        }
    draw1('language', 'doughnut', 'languages', "Languages in the Repository", label, data, backgroundColor);
}

async function get_graph(repo) {
    let label = [];
    let commits = [];
    let addition = [];
    let deletion = [];
    let contributors="";
    let stats=repo;
    
    for (stat in stats) {
        if (stats[stat].author.login == globalId) {   
            for (ad in stats[stat].weeks) {
                    
                    if(stats[stat].weeks[ad].a>0 ||stats[stat].weeks[ad].b>0||stats[stat].weeks[ad].c>0){
                        label.push(ad);
                        addition.push(stats[stat].weeks[ad].a);                    
                        deletion.push(stats[stat].weeks[ad].d);
                        commits.push(stats[stat].weeks[ad].c);
                    }
            }

        }
        contributors+=stats[stat].author.login+" ";        
    }
    draw2('graph_cad', 'bar', 'line', 'Additions and Deletions of '+ globalId+ " for this repository", label, addition, deletion,commits,contributors);
   
}

//drawing graphs using Chart.js
function draw1(ctx, type, datasetLabel, titleText, label, data, backgroundColor) {
    let myChart = document.getElementById(ctx).getContext('2d');
    chart1 = new Chart(myChart, {
        type: type,
        data: {
            labels: label,
            datasets: [{
                label: datasetLabel,
                data: data,
                backgroundColor: backgroundColor,
                borderWidth: 1,
                hoverBorderWidth: 2,
                hoverBorderColor: '#000'
            }],

        },
        options: {
            responsive: true,
            plugins: {
              legend: {
                position: 'bottom',
              },
              title: {
                display: true,
                text: titleText
              }
            }
          },
    });
}
function draw2(ctx, type, type2, titleText, datasetLabel, dataset1, dataset2,dataset3,contributors) {
    let myChart = document.getElementById(ctx).getContext('2d');
    chart2 = new Chart(myChart, {
        type: type,
        data: {
            labels: datasetLabel,
            datasets: [{
                type: type,
                label: 'Addition',
                borderColor: 'rgba(0, 0, 255, 0.7)',
                backgroundColor:'rgba(0, 0, 255, 0.2)',
                borderWidth: 1,
                hoverBorderWidth: 2,               
                fill: true,
                data: dataset1,
                
            },
            {
                type: type2,
                label: 'Deletion',
                borderColor: 'rgba(255, 0,0, 0.7)',
                backgroundColor:'rgba(255, 0,0, 0.2)',
                borderWidth: 1,
                hoverBorderWidth: 2,
                fill: true,
                data: dataset2,

            },
            {
                type: type2,
                label: 'Commits',
                borderColor: 'rgba(0, 255, 0, 1)', 
                borderWidth: 1,
                hoverBorderWidth: 2,
                data: dataset3,
                yAxisID: 'y-axis-1'
            }
           ]

        },
        options: {
            responsive: true,
            plugins: {
              legend: {
                position: 'bottom',
              },
              title: {
                display: true,
                text: titleText
              },
              subtitle: {
                display: true,
                text: 'Contributors: '+ contributors
            }
            }
          },
    });
}