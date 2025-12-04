'use client';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {ScheduleButton} from '@/components/schedule-button';
import { createContactSubmission } from '@/actions/createContactSubmission';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const result = await createContactSubmission(formData);
      
      if (result.success) {
        toast.success('Thank you for your message! We\'ll get back to you soon.');
        setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
      } else {
        toast.error('Failed to submit your message. Please try again.');
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      toast.error('An error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const contactInfo = [
    {
      title: 'Phone',
      value: '01317770555',
      icon: '📞'
    },
    {
      title: 'Phone',
      value: '01838496666',
      icon: '📞'
    },
    {
      title: 'Email',
      value: 'etopmaintenance@gmail.com',
      icon: '✉️'
    },
    {
      title: 'Address',
      value: 'Chayabithi mashjid, Bashabo 1000 Khilgaon, Bangladesh',
      icon: '📍'
    },
    {
      title: 'Hours',
      value: 'Mon-Fri: 9AM-6PM, Sat: 10AM-4PM',
      icon: '🕒'
    }
  ];

  return (
    <div className="min-h-screen bg-lightBg">
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Contact <span className="text-primary">Us</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            {`Ready to upgrade your sleep? Have questions about our mattresses?
            We'd love to hear from you and help you find the perfect mattress for better rest. `}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
          {/* Contact Form */}
          <Card className="shadow-lg">
            <CardContent className="p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Send Us a Message</h2>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Full Name *</Label>
                    <Input
                      id="name"
                      name="name"
                      type="text"
                      required
                      value={formData.name}
                      onChange={handleChange}
                      className="mt-1"
                      placeholder="John Doe"
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email Address *</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      className="mt-1"
                      placeholder="john@example.com"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={handleChange}
                      className="mt-1"
                      placeholder="+1 (555) 123-4567"
                    />
                  </div>
                  <div>
                    <Label htmlFor="subject">Subject *</Label>
                    <Input
                      id="subject"
                      name="subject"
                      type="text"
                      required
                      value={formData.subject}
                      onChange={handleChange}
                      className="mt-1"
                      placeholder="Mattress Consultation"
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="message">Message *</Label>
                  <Textarea
                    id="message"
                    name="message"
                    required
                    value={formData.message}
                    onChange={handleChange}
                    className="mt-1 min-h-32"
                    placeholder="Tell us about your sleep needs and what you're looking for..."
                  />
                </div>
                
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-primary hover:bg-primary/90 text-white py-3 disabled:opacity-50"
                >
                  {isSubmitting ? 'Sending...' : 'Send Message'}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <div className="space-y-8">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Get in Touch</h2>
              <p className="text-gray-600 mb-8">
                {`We're here to help you find the perfect mattress for better sleep. Whether you need a consultation,
                have questions about our products, or want to discuss delivery options, don't hesitate to reach out.`}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-6">
              {contactInfo.map((info, index) => (
                <Card key={index} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4 sm:p-6">
                    <div className="flex items-start sm:items-center space-x-3 sm:space-x-4">
                      <div className="text-xl sm:text-2xl flex-shrink-0 mt-1 sm:mt-0">{info.icon}</div>
                      <div className="min-w-0 flex-1">
                        <h3 className="font-semibold text-gray-900 text-sm sm:text-base mb-1">{info.title}</h3>
                        <p className={`text-gray-600 text-xs sm:text-sm leading-tight ${
                          (info.title === 'Phone' || info.title === 'Email') 
                            ? 'break-all sm:break-normal word-break-keep-all' 
                            : ''
                        }`}>
                          {info.title === 'Phone' ? (
                            <a
                              href={`tel:${info.value}`}
                              className="text-primary hover:text-primary/80 transition-colors"
                            >
                              {info.value}
                            </a>
                          ) : info.title === 'Email' ? (
                            <a
                              href={`mailto:${info.value}`}
                              className="text-primary hover:text-primary/80 transition-colors"
                            >
                              {info.value}
                            </a>
                          ) : (
                            info.value
                          )}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Quick Actions */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Quick Actions</h3>
              <div className="space-y-3">
                <ScheduleButton />
               
              </div>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <section className="bg-white rounded-2xl p-8 md:p-12 mb-16 shadow-sm">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h2>
            <p className="text-gray-600">Quick answers to common questions about our mattresses and services</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[
              {
                question: 'What sizes of mattresses do you offer?',
                answer: 'We offer all standard sizes including Twin, Full, Queen, King, and California King. Custom sizes are also available upon request.'
              },
              {
                question: 'Do you provide home delivery?',
                answer: 'Yes! We offer free home delivery and setup within Dhaka. We also provide installation services to ensure your mattress is perfectly placed.'
              },
              {
                question: 'What is your return policy?',
                answer: 'We offer a 30-day comfort guarantee. If you are not satisfied with your mattress, you can exchange it or get a full refund.'
              },
              {
                question: 'Do you have financing options?',
                answer: 'Yes! We offer flexible payment plans and financing options to make your purchase more affordable. Contact us to learn more.'
              }
            ].map((faq, index) => (
              <div key={index} className="space-y-2">
                <h4 className="font-semibold text-gray-900">{faq.question}</h4>
                <p className="text-gray-600 text-sm">{faq.answer}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Map Placeholder */}
        {/* <section className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Visit Our Showroom</h2>
          <div className="bg-gray-200 rounded-2xl h-64 flex items-center justify-center mb-6">
            <div className="text-center">
              <div className="text-4xl mb-2">🗺️</div>
              <p className="text-gray-600">Interactive map would be displayed here</p>
              <p className="text-sm text-gray-500">123 Green Street, Plant City, PC 12345</p>
            </div>
          </div>
          <Button className="bg-green-600 hover:bg-green-700 text-white px-8 py-3">
            Get Directions
          </Button>
        </section> */}
       
      </main>

    </div>
  );
};

export default Contact;
