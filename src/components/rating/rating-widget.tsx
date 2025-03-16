import { useEffect, useState } from 'react'
import { createTheme, Rating, Stack, ThemeProvider, Typography } from '@mui/material'
import { storageGet, storageSet } from '../../utils/localStorage'

export const RATING_KEY = 'app_rating_score'

const FEEDBACK_FORM_LINK = 'https://docs.google.com/forms/d/e/___YOUR_DOC___/viewform'
const GOOD_REVIEW_LINK = 'https://chromewebstore.google.com/detail/___YOUR_EXT___/reviews'

const RatingWidget = () => {
  const [value, setValue] = useState<number | null>(0)

  useEffect(() => {
    storageGet(RATING_KEY, (val) => {
      if (val) {
        setValue(+val)
      }
    })
  }, [])

  // @ts-ignore
  const handleClick = (e, value) => {
    setValue(value)

    if (value > 3) {
      window.open(GOOD_REVIEW_LINK, '_blank', 'noreferrer')
    } else {
      window.open(FEEDBACK_FORM_LINK, '_blank', 'noreferrer')
    }

    storageSet(RATING_KEY, value)
  }

  const themeRating = createTheme({
    direction: window.getComputedStyle(document.body, null).getPropertyValue('direction') as 'rtl'
  });

  return (<>
    <Stack direction={'row'} className="rating-widget" justifyContent={'center'} alignItems={'center'}
           paddingTop={'3px'}>
      <Typography variant={'body2'} sx={{ marginRight: '5px' }}>{'Rate us now!'}</Typography>
      <ThemeProvider theme={themeRating}>
        <Rating
          name="size-small"
          value={value}
          size="small"
          sx={{ marginRight: '10px' }}
          onChange={handleClick}
        />
      </ThemeProvider>
    </Stack>
  </>)
}

export default RatingWidget
