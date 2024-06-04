// BusinessPlan.js
import React, { useContext, useState } from 'react';
import TextArea from '@leafygreen-ui/text-area';
import Button from '@leafygreen-ui/button';

function BusinessPlan() {
  const apiResponse = useContext('');
  const [value, setValue] = useState('');

  const handleSubmit = () => {
    console.log('TextArea Value:', value);
    console.log('API Response:', apiResponse);
  };

  return (
    <>
      <TextArea
        style={{ minWidth: '500px', minHeight: '400px' }}
        label="Input your business plan here"
        description="Write around 50 to 100 words about your business plan."
        onChange={event => {
          setValue(event.target.value);
        }}
        value={value}
      />
      <Button style={{ marginTop: '5px', alignItems: 'left' }} onClick={() => {
        handleSubmit();
      }}>Submit</Button>
    </>
  );
}

export default BusinessPlan;