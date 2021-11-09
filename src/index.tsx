import * as React from "react";
import { registerWidget, registerLink, registerUI, IContextProvider, } from './uxp';
import { TitleBar, FilterPanel, ToggleFilter, WidgetWrapper } from "uxp/components";
import './styles.scss';

{/* <link rel="stylesheet" href="https://pro.fontawesome.com/releases/v5.10.0/css/all.css" integrity="sha384-AYmEC3Yw5cVb3ZcuHtOA93w35dYTsvhLPVnYs9eStHfGJvOvKxVfELGroGkvsg+p" /> */}

import * as Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
 

interface IWidgetProps {
    uxpContext?: IContextProvider,
    instanceId?: string
}


const Lost_Found_TrendsWidget: React.FunctionComponent<IWidgetProps> = (props) => { 
    let [data, setData] = React.useState<any>({})
    let [details, setDetails] = React.useState<any>({})
    let [result, setResult] = React.useState<any>([])
    let [parkingLables,setparkingLables]=React.useState<any>([])
    
    let [highchartsOptions, setHighchartsOptions] = React.useState<any>({}) 
    
    React.useEffect(()=>{            
            getParkingDetails('Daily')    
        },[]);

    async function getParkingDetails(DateQuery:string) {
        if(DateQuery == 'Monthly'){
            document.getElementById('WeeklyBtn').style.backgroundColor = '';
            document.getElementById('DailyBtn').style.backgroundColor = '';
            document.getElementById('MonthlyBtn').style.background = '#D4FDC1';
        } else if(DateQuery == 'Weekly'){
            document.getElementById('MonthlyBtn').style.backgroundColor = '';
            document.getElementById('DailyBtn').style.backgroundColor = '';
            document.getElementById('WeeklyBtn').style.backgroundColor = '#D4FDC1';
        } else if(DateQuery == 'Daily'){
            document.getElementById('MonthlyBtn').style.backgroundColor = '';
            document.getElementById('WeeklyBtn').style.backgroundColor = '';
            document.getElementById('DailyBtn').style.backgroundColor = '#D4FDC1';
        }

        let params = {                    
                    DateQuery: DateQuery
                }
       // let cdata = await props.uxpContext.executeAction('AdaniDashboard','PMSOccupancy',params,{json:true});

       let cdata = await props.uxpContext.executeAction('AdaniDashboard','PMSOccupancylevel',params,{json:true});
                 
        let me=cdata.ParkingUtilization;
        let details=me.details;
        let result=details.result;
                
        constructLables(me);
        setData(me);
        setDetails(details);
        setResult(result);
        gethighchart(result,DateQuery);
    }

    function constructLables(lables:any){
        let lablesOfParking = `<ul>
                                <li>
                                <div class="user-icon"></div>  
                                    <h4> 21
                                        <span>Bags</span>
                                    </h4>
                                </li>
                                <li>
                                    <div class="user-icon"></div>
                                    <h4> 14
                                        <span>Mobiles</span>
                                    </h4>
                                </li>
                                <li>
                                    <div class="user-icon"></div>
                                    <h4> 26
                                        <span>Wallets</span>
                                    </h4>
                                </li>
                                <li>
                                    <div class="user-icon"></div>
                                    <h4> 17
                                        <span>keys</span>
                                    </h4>
                                </li>
                            </ul>`;

        setparkingLables(lablesOfParking);
    }

    function gethighchart(result:any, DateQuery:string){
        let tm:any[] = [], tv:any[] = [], year_list = [],
        parking_final:any[] = [], parking_final_two:any[] = [], 
        parkingString = [], parkingStringTwo = [];
        let frequency=''
        for (var i of result) {
            tm.push(parseInt(i.TotalEmployeeVehicles));
            tv.push(parseInt(i.TotalVisitorVehicles));

            let dtt = new Date(i.isoDate);
            var dows=['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
            var dow= dows[(dtt).getDay()];  
            if(DateQuery == 'Daily'){
                year_list.push(parseInt(i.Number)+ ':00');
              } 
             else if(DateQuery == 'Weekly'){
                year_list.push(dow); 
             }
             else if(DateQuery == 'Monthly'){
                year_list.push('WK' + i.Number + ' <br/> ' + i.isoDate.substring(0,10)); 
             } 

             parkingString.push(i.TotalEmployeeVehicles);
             parkingStringTwo.push(i.TotalVisitorVehicles); 

        }
        
        // querry send string that we need to convert into numbers
        for (var j = 0; j < parkingString.length; j++) {
            if (parkingString[j] != null) {
            parking_final.push(parseFloat(parkingString[j]))
            } else {
            parking_final.push(null)
            };
        }
        
        for (var k = 0; k < parkingStringTwo.length; k++) {
            if (parkingStringTwo[k] != null) {
            parking_final_two.push(parseFloat(parkingStringTwo[k]))
            } else {
            parking_final_two.push(null)
            };
        }
        
        const options = {
          
            chart: {
                height: 200,
                // type: 'line'
                type: 'areaspline'
                
            },
            title: {
                text:''
            },
            credits: {
              enabled: false
            },
            tooltip: { 
               pointFormat: '<span style="color:{point.color}">\u25CF</span> {series.name}: <b>{point.y}</b><br/>',
                  enabled: true,
               shared: true, 
            },
            legend: {
                reversed: true
            },
            xAxis: {
                categories: year_list,
                tickWidth: 1,
                    tickmarkPlacement:'on',
                    crosshair: {
                      snap: false,
                      width: 1,
                      color: 'red',
                      dashStyle: 'shortdot',
                      zIndex: 10
                    }
            },
            yAxis: [{
                title: { text: 'Count' }
              }],
              navigation: {
                    buttonOptions: {
                        enabled: false
                    }
                },
            series: [{
                 name: 'Lost items',
                data: parking_final,
                 color : '#11822b'
              }, 
              {
                name: 'Found items',
                data: parking_final_two,
                color : '#1666b7'
               
            }],
            plotOptions: {
                areaspline: {
                    pointStart: 0,
                   // tickposition:'outside',
                    marker: {
                        enabled: false,
                        symbol: 'circle',
                        radius: 2,
                        states: {
                            hover: {
                                enabled: true
                            }
                        }
                        }
                        }
            }
        };
        setHighchartsOptions(options)
    }

    const App = () => (
        <div>
          <HighchartsReact highcharts={Highcharts} options={highchartsOptions} />
        </div>
    );



    let [toggleFilterValue, setToggleFilterValue] = React.useState<string>("month");

  

    return (<WidgetWrapper className="lost_found-widget"> 
    <TitleBar title="LOST AND FOUND TRENDS" icon="https://static.iviva.com/images/uxp-generic-widgets/lost-found.png">
        <div className="cafeteria-top-options found-lost-top-options">                
           
             <ul className="meeting-room-top-tabs">
                <li id='MonthlyBtn' onClick={() =>{getParkingDetails('Monthly')} }><a>Monthly</a></li>
                <li id='WeeklyBtn' onClick={() =>{getParkingDetails('Weekly')} }><a>Weekly</a></li>
                <li id='DailyBtn' onClick={() =>{getParkingDetails('Daily')} }><a className="meeting_active">Daily</a></li>
            </ul>    
 


            {/* <ToggleFilter  className="meeting-room-top-tabs"
                options={[
                    { label: "Monthly", value: "month"} ,
                    { label: "Weekly", value: "week" },
                    { label: "Daily", value: "day" },
                ]}
                value={toggleFilterValue}
                    onClick={() =>{getParkingDetails('Monthly'|| 'Weekly' ||'Daily')}  }
                onChange={(value) => { setToggleFilterValue(value) }}
            />  */}


            


        </div>
    </TitleBar>

    <div className="body">
        <div className="cafeteria_utilization-cont parking_utilization-cont">
            <div className="cafeteria_utilization-cont-top">
                <div className="parking_data"> 
                    <div className="cafeteria_utilization-list parking_utilization-list" dangerouslySetInnerHTML={{__html: parkingLables }}></div>
                </div> 
            </div>
        </div>
    </div>
    <App/>
    </WidgetWrapper>)
}

/**
 * Register as a Widget
 */
registerWidget({
    id: "Lost_Found_Trends",
    widget: Lost_Found_TrendsWidget,
    configs: {
        layout: {
            // w: 12,
            // h: 12,
            // minH: 12,
            // minW: 12
        }
    }
});

/**
 * Register as a Sidebar Link
 */
/*
registerLink({
    id: "Lost_Found_Trends",
    label: "Lost_Found_Trends",
    // click: () => alert("Hello"),
    component: Lost_Found_TrendsWidget
});
*/

/**
 * Register as a UI
 */

 /*
registerUI({
    id:"Lost_Found_Trends",
    component: Lost_Found_TrendsWidget
});
*/