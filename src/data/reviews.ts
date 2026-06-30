import fallbackAvatar from '../assets/UFT-Favicon.png'

export type TripAdvisorReview = {
  id: string
  name: string
  country: string
  date: string
  rating: number
  profileImage: string
  sourceUrl: string
  title: string
  text: string
}

export const tripAdvisorUrl = 'https://www.tripadvisor.com/Attraction_Review-g608446-d23143576-Reviews-Uganda_Family_Tours_Travel-Fort_Portal_Western_Region.html'

export const reviews: TripAdvisorReview[] = [
  {
    id: 'review-01-sheery-r',
    name: 'Sheery R',
    country: '',
    date: 'May 31, 2026',
    rating: 5,
    profileImage: fallbackAvatar,
    sourceUrl: 'https://www.tripadvisor.com/ShowUserReviews-g608446-d23143576-r1062411601-Uganda_Family_Tours_Travel-Fort_Portal_Western_Region.html',
    title: 'Trip of a lifetime',
    text: 'It was a trip of a lifetime. We were able to explore this beautiful country with the best people. Jackson was an incredible guide as we were able to see countless elephants, giraffes, water buffalo, antelopes, baboons and other species. The accommodations were spectacular and made the experience that much more memorable.',
  },
  {
    id: 'review-02-scott-r',
    name: 'scott r',
    country: '',
    date: 'May 26, 2026',
    rating: 5,
    profileImage: fallbackAvatar,
    sourceUrl: 'https://www.tripadvisor.com/ShowUserReviews-g608446-d23143576-r1061817464-Uganda_Family_Tours_Travel-Fort_Portal_Western_Region.html',
    title: 'Uganda Family Yours & Family - Outstanding!',
    text: 'My wife, adult daughter, and I spent five days with Jackson and Lucky primarily in Murchison Falls National Park, Uganda. I have been fortunate enough to have enjoyed many adventure travel experiences all around our world, and I have to say, this was one of the very best. Before arriving in Uganda, I told Jackson that we wanted to experience as much as possible, and he delivered. He guided us through the planning process and created an itinerary based on what we wanted. Jackson and Lucky guided us to amazing animal experiences. We were treated to a wide variety of animal sightings seemingingly on a minute-by-minute basis. Jackson\'s expert eyes found the animals, his expertise provided the insight on each species, all while we rode securely and comfortably in his roof-lifting Land Cruiser. So many great memories, so many great photos! Salute to Jackson and Lucky for making this a trip of a lifetime! I whole-heartedly recommend Uganda Family Tours & Safari Company!',
  },
  {
    id: 'review-03-j-n',
    name: 'J N',
    country: '',
    date: 'April 8, 2026',
    rating: 5,
    profileImage: fallbackAvatar,
    sourceUrl: 'https://www.tripadvisor.com/ShowUserReviews-g608446-d23143576-r1055820662-Uganda_Family_Tours_Travel-Fort_Portal_Western_Region.html',
    title: 'An Unforgettable 10-Day Uganda Adventure - Jackson is the Ultimate Guide!',
    text: 'We recently completed an incredible 10-day "Gorillas, Chimps & Wildlife Safari" with Uganda Family Tours and Travel, and it was truly the experience of a lifetime. From the moment we landed in Entebbe until our final departure, every detail was perfectly organized. The absolute highlight of our trip besides the wildlife, primate encounters and accommodations was our guide, Jackson. Jackson\'s passion for his country and his profound knowledge of wildlife made every moment special. Whether we were on a game drive in Murchison Falls or searching for the famous tree-climbing lions in the Ishasha Sector, Jackson\'s expert eyes and storytelling brought the landscapes to life. He was professional, patient, and always went the extra mile to ensure we had the best possible views and photo opportunities. If you are planning a trip to Uganda Jackson and Uganda Family Tours and Travel is the company to go to. They turned a great vacation into an extraordinary journey that we will never forget. Thank you, Jackson, for showing us the "Pearl of Africa" in such an authentic and professional way!',
  },
  {
    id: 'review-04-fola-o',
    name: 'Fola O',
    country: '',
    date: 'March 31, 2026',
    rating: 5,
    profileImage: 'https://dynamic-media-cdn.tripadvisor.com/media/photo-o/1a/f6/e9/bb/default-avatar-2020-65.jpg?w=100&h=100&s=1',
    sourceUrl: 'https://www.tripadvisor.com/ShowUserReviews-g608446-d23143576-r1054935963-Uganda_Family_Tours_Travel-Fort_Portal_Western_Region.html',
    title: 'Thank You',
    text: 'I had such a great experience with this company. I arranged everything from the U.S. for my elderly parents traveling from Nigeria, and they truly went above and beyond. It was their first time visiting Lake Uganda, and the team made the entire process smooth and stress-free. They picked my parents up from the airport right on time and were incredibly patient, kind, and helpful throughout their stay. Knowing my parents were well taken care of gave me so much peace of mind. I\'m really grateful for their professionalism and genuine care - highly recommend!',
  },
  {
    id: 'review-11-elena-n',
    name: 'Elena N',
    country: '',
    date: 'July 22, 2025',
    rating: 5,
    profileImage: fallbackAvatar,
    sourceUrl: 'https://www.tripadvisor.com/ShowUserReviews-g608446-d23143576-r1020233138-Uganda_Family_Tours_Travel-Fort_Portal_Western_Region.html',
    title: 'Unforgettable trip with Uganda Family Tours!',
    text: 'I had an amazing adventure organized through Uganda Family Tours with my knowledgeable driver Roland, for chimpanzee trekking and gorilla habituation. Everything went smoothly; all accommodations and meals were great, with amazing views and unforgettable experiences. Of all the companies I contacted, they were also the cheapest. I would definitely recommend Jackson of Uganda Family Tours to organize your next adventure in Uganda.',
  },
  {
    id: 'review-06-hirsty-nz',
    name: 'Hirsty-NZ',
    country: 'Auckland Central, New Zealand',
    date: 'January 17, 2026',
    rating: 5,
    profileImage: 'https://dynamic-media-cdn.tripadvisor.com/media/photo-o/15/62/fd/09/hirsty-nz.jpg?w=100&h=100&s=1',
    sourceUrl: 'https://www.tripadvisor.com/ShowUserReviews-g608446-d23143576-r1046427118-Uganda_Family_Tours_Travel-Fort_Portal_Western_Region.html',
    title: 'Wonderful family safari experience',
    text: 'We did a 10 day / 9 night safari, that took in 4 national parks (Murchison Falls, Kibale, Queen Elizabeth and Bwindi Impenetrable Forest. A really amazing family experience, hard to name specific highlights as there we so many (chimps, gorillas, giraffes, hippos, elephants, crocodiles, buffalo, lions and leopards just to name a few). The trip was very well coordinated and scheduled, and we stayed in 4 very nice lodges (Pakuba Safari Lodge, Turaco Treetops Lodge, Elephant Hab Lodge and Ichumbi Gorilla Lodge), having 2 nights in each (3 at Pakuba). We had excellent communication with the company owner Jackson, from the outset, and he patiently worked with us while we tweaked and changed the schedule, and were very happy with what we ended up with. We were fortunate to have Jackson as our guide, and he was excellent company and very knowledgeable on all things Uganda and of course on the animals we saw on safari. It was a full on 10 days, we had so many amazing encounters with animals (up very close), and were very much at home in the 4 lovely lodges we stayed in (all had very generous rooms, friendly staff and wonderful food). A trip of a lifetime with a teenage / young adult kids - I would highly recommend Uganda Family Tours & Travel - easy to deal with, very trustworthy (which is important whera you are booking and paying for you trip in advance from the other side of the world), and they gave us a wonderful, hassle free trip.',
  },
  {
    id: 'review-07-tim-p',
    name: 'Tim P',
    country: 'Sheffield, Illinois',
    date: 'January 5, 2026',
    rating: 5,
    profileImage: 'https://dynamic-media-cdn.tripadvisor.com/media/photo-o/1a/f6/f0/d5/default-avatar-2020-17.jpg?w=100&h=100&s=1',
    sourceUrl: 'https://www.tripadvisor.com/ShowUserReviews-g608446-d23143576-r1045055842-Uganda_Family_Tours_Travel-Fort_Portal_Western_Region.html',
    title: 'Relaxed and professional.',
    text: 'We had an excellent experience with Brian, including an unplanned trip to a couple shopping areas in Entebbe to help us find some clothes as our luggage did not arrive with us and we were leaving early the next morning. He even helped us arrange for delivery of our bags. The rest of the trip was great. He provided all the essential details and was very easy to talk to when we had more questions. The game drives went well and he was clearly working hard and communicating with the other guides to help us see all the animals we could, including a leopard. We had to quickly turn the Jeep around to get where we needed to be to see it. Brian was relaxed, thoughtful and worked hard to make it a great trip for my son and I.',
  },
  {
    id: 'review-08-anna-p',
    name: 'Anna P',
    country: '',
    date: 'December 26, 2025',
    rating: 5,
    profileImage: 'https://dynamic-media-cdn.tripadvisor.com/media/photo-o/1a/f6/f4/d0/default-avatar-2020-33.jpg?w=100&h=100&s=1',
    sourceUrl: 'https://www.tripadvisor.com/ShowUserReviews-g608446-d23143576-r1043759197-Uganda_Family_Tours_Travel-Fort_Portal_Western_Region.html',
    title: 'Lovely, easy and... perfecte!',
    text: 'Before, during and after trip we had feel so good with this team, we help us to with everything that we need: Chimps and gorillas license, car renting, driver(friend and guide as well, thanks a lot Bob!) and help and attenttion by whatsapp everyday. Thanks for everything Jackson!',
  },
  {
    id: 'review-09-john-r',
    name: 'John R',
    country: '',
    date: 'December 22, 2025',
    rating: 5,
    profileImage: 'https://dynamic-media-cdn.tripadvisor.com/media/photo-o/1a/f6/ed/00/default-avatar-2020-4.jpg?w=100&h=100&s=1',
    sourceUrl: 'https://www.tripadvisor.com/ShowUserReviews-g608446-d23143576-r1043381990-Uganda_Family_Tours_Travel-Fort_Portal_Western_Region.html',
    title: 'LOVED IT!! So much fun!! AMAZING!!',
    text: 'Went on a mission trip to Uganda and got to do a 1 day safari and river ride on the Nile. Uganda Family Tours did excellent in all ways. Great time, took care of us completely, and their knowledge going through the safari was amazing! Fantastic people! I DEFINITELY RECOMMEND. Look forward to doing it all again next year. Jackson and Bryan and Jonathon are amazing. What an AMAZING time. THANK YOU so much!! Loved it!!',
  },
  {
    id: 'review-12-mike-n',
    name: 'Mike N',
    country: '',
    date: 'May 27, 2025',
    rating: 5,
    profileImage: fallbackAvatar,
    sourceUrl: 'https://www.tripadvisor.com/ShowUserReviews-g608446-d23143576-r1009805619-Uganda_Family_Tours_Travel-Fort_Portal_Western_Region.html',
    title: 'An unforgettable adventure at a reasonable price',
    text: 'Our trip organized with Uganda Family Tours was one of the best trips ever. Jackson, the CEO of the company, was in contact with us from the very beginning, very friendly, always very responsive and so eager to make our trip to Uganda perfect, and fit everything we wanted to do in the plan. He put together an amazing itinerary for us, all displayed in a very nice and detailed PDF document, where we could see daily activities and also check out the lodges he chose for us. We very much appreciated the transparency and the flexibility in making whatever adjustments we wanted. Our tour guide, Roland, was honestly the best. In fact, we felt we were visiting Uganda with a friend, not a guide. The entire tour was very well planned and perfectly executed, and every day brought new adventures.',
  },
]
