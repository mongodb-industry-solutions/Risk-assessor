// BusinessPlan.js
import React, {useEffect,  useState, useRef } from 'react';
import TextArea from '@leafygreen-ui/text-area';
import Button from '@leafygreen-ui/button';
import { useMarkers } from '../context/Markers';
import SpeechToText from './SpeechToText'; 


function BusinessPlan() {
  const {markers, address,llmResponse, setLlmResponse, setLoading} = useMarkers(''); 
  const [value, setValue] = useState('');

  const handleSpeechResult = (result) => {
    setValue(value + ' ' + result);
    console.log('value:', value); 
  };

  const groupFloodsByDistance = (floods) => {
    const groupedFloods = {
      lessThan5km: {},
      over5km: {},
    };
  
    floods.forEach(flood => {
      if (!flood.year || !flood.distance) return; // Skip if year or distance is not defined
  
      const year = flood.year;
  
      if (flood.distance < 5000) {
        groupedFloods.lessThan5km[year] = (groupedFloods.lessThan5km[year] || 0) + 1;
      } else {
        groupedFloods.over5km[year] = (groupedFloods.over5km[year] || 0) + 1;
      }
    });
  
    return groupedFloods;
  };
  
  const sendPromptToGpt3 = async (prompt) => {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.NEXT_PUBLIC_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [
          { role: "system", content: "You are a helpful assistant." },
          { role: "user", content: prompt }
        ],
        max_tokens: 3000,
      }),
    });
  
    const data = await response.json();
    //console.log('data:', data.choices[0].message.content);
    setLlmResponse(data.choices[0].message.content);
    setLoading(false);
    return data.choices[0].text;
  };

  const handleSubmit = () => {
    setLoading(true); 
    const groupedFloods = groupFloodsByDistance(markers);
    if (value.length < 10) {
      window.alert('Please expand on your business idea!');
      return;
    }
    if (address == undefined || address == '') {
      window.alert('Please imput an adress on the map');
      return;
    }
    //console.log('groupedFloods:', groupedFloods);
    //console.log('Address:',address);
    const prompt = `
    Instructions:
    - You will be stepping in the shoes of a risk assessor for a business loan company.
    - The year is 2021, however try to not mention this if posible, in fact try to use relative terms like "last year" or "next year" and not specific dates. 
    - Write a 150-word assessment discussing the viability of the retail business. Do not provide advice, rather assess the risks and potential of the business.
    - Provide the costs, revenue potential. If possible, provide quantitative data for these.
    - Analyze local competition, demographics, foot traffic.
    - Above all, analyze the impact of any environmental risks represented by the flood data provided.
    - Avoid making lists, use distinct paragraphs for each part.
    - The end-user is not aware of the flood data, so you should not mention it like "The data indicates", instead you should use expressions like "No recorded floods within a 5 km were found..."
    
    Definitions:
    Business Description: A short description with a retail business idea.
    Address: The address where the potential business would be located.
    Floods: This JSON object represents the count of flood events from 2016 to 2020, sourced from seven merged datasets supporting diverse flood-related research. The sources are:
    
    - University of Oklahoma's crowdsourced database
    - Dartmouth Flood Observatory
    - Emergency Events Database by the Centre for Research on the Epidemiology of Disasters
    - NOAA's Storm Reports
    - University of Connecticut's Flood Events Database
    - Crowdsourced data from Twitter
    - NOAA's mPing app
    
    The data is categorized by year and grouped by the distance of the flood events into three categories: "lessThan5km" is for floods that are less than 5 km away and "over5km" is for floods that are  over 5 km away.
    
    {
        "lessThan5km": {
            "2018": 3
        },
        "over5km": {
            "2017": 1,
            "2018": 11,
            "2019": 1
        }
    }

    Explanation:
    - "lessThan5km": Flood events that occurred less than 5 kilometers away. In 2018, there were 3 such events.
    - "over5km": Flood events that occurred more than 5 kilometers away. In 2017, there was 1 event, in 2018 there were 11 events, and in 2019 there was 1 event.
    
    Inputs:
    Business Description: ${value}
    Address: ${markers.address}
    Floods: ${JSON.stringify(groupedFloods)}`
    console.log('prompt:',prompt);
    sendPromptToGpt3(prompt);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
      <TextArea
        style={{ minWidth: '600px', minHeight: '300px' }}
        label="Input your business plan here"
        description="Write a couple dozen words about your business plan."
        onChange={event => {
          setValue(event.target.value);
        }}
        value={value}
        disabled={llmResponse !== ''}
      />{/*disabled={llmResponse !== ''}*/}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '5px' }}>
        <SpeechToText onSpeechResult={handleSpeechResult} /> 
        <Button onClick={() => {
          setLlmResponse('');
          setValue('');
          window.location.reload();
        }} disabled={llmResponse == ''}>back</Button>
        <Button style={{ marginLeft: '5px' }} onClick={() => {
          handleSubmit();
        }} disabled={llmResponse !== ''}>Submit</Button>
      </div>
    </div>
  );
}

export default BusinessPlan;